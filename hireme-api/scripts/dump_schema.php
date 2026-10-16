<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$columns = DB::select("
    SELECT table_name, column_name, data_type, is_nullable, character_maximum_length, numeric_precision, numeric_scale, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
");

$tables = [];
foreach ($columns as $c) {
    $t = $c->table_name;
    if (!isset($tables[$t])) {
        $tables[$t] = [];
    }
    $tables[$t][] = [
        'name' => $c->column_name,
        'type' => $c->data_type,
        'nullable' => $c->is_nullable === 'YES',
        'length' => $c->character_maximum_length,
        'precision' => $c->numeric_precision,
        'scale' => $c->numeric_scale,
        'default' => $c->column_default
    ];
}

$fks = DB::select("
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
");

$pks = DB::select("
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public';
");

$uniques = DB::select("
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public';
");

$constraints = [
    'foreign_keys' => $fks,
    'primary_keys' => $pks,
    'unique_keys' => $uniques,
];

file_put_contents(__DIR__ . '/../../diagrams/build/db_constraints.json', json_encode($constraints, JSON_PRETTY_PRINT));
file_put_contents(__DIR__ . '/../../diagrams/build/db_schema_actual.json', json_encode($tables, JSON_PRETTY_PRINT));
echo "Schema and constraints dumped successfully. Total tables: " . count($tables) . ", Total FKs: " . count($fks) . PHP_EOL;

