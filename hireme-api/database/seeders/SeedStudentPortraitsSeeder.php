<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\PersistentFileService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SeedStudentPortraitsSeeder extends Seeder
{
    private const FEMALE_NAMES = [
        'abigail', 'adriana', 'aileen', 'aisha', 'alexa', 'alexandra', 'alice', 'alicia', 'alina',
        'alison', 'allison', 'alyssa', 'amanda', 'amber', 'amelia', 'amy', 'andrea', 'angela',
        'angelica', 'angelina', 'angeline', 'anita', 'ann', 'anna', 'annabelle', 'anne', 'annie',
        'april', 'ariana', 'ariane', 'ariel', 'ashley', 'aubrey', 'audrey', 'ava', 'beatrice',
        'beatriz', 'bella', 'bernadette', 'beth', 'bianca', 'brenda', 'bridget', 'camille',
        'candice', 'carla', 'carmela', 'carmen', 'carol', 'caroline', 'casey', 'cassandra',
        'catherine', 'cecilia', 'celeste', 'celine', 'charlene', 'charlotte', 'chloe', 'christine',
        'claire', 'clara', 'clarisse', 'claudia', 'colleen', 'crystal', 'cynthia', 'daisy',
        'dana', 'danica', 'daniela', 'danielle', 'daphne', 'dawn', 'deborah', 'denise', 'diana',
        'dianne', 'donna', 'elaine', 'eleanor', 'elena', 'elisa', 'elizabeth', 'ella', 'ellen',
        'eloise', 'emily', 'emma', 'erica', 'erika', 'erin', 'esther', 'eunice', 'eva', 'evelyn',
        'faith', 'fatima', 'faye', 'felicia', 'fiona', 'florence', 'frances', 'francesca',
        'gabriela', 'gabrielle', 'gail', 'gemma', 'genevieve', 'georgia', 'gianna', 'gillian',
        'gina', 'giselle', 'gloria', 'grace', 'gretchen', 'hailey', 'hannah', 'hazel', 'heather',
        'helen', 'helena', 'hope', 'irene', 'iris', 'isabel', 'isabela', 'isabella', 'isabelle',
        'ivy', 'jacqueline', 'jade', 'jane', 'janelle', 'janet', 'janice', 'janine', 'jasmine',
        'jean', 'jenna', 'jennifer', 'jenny', 'jessica', 'jillian', 'joan', 'joanna', 'joanne',
        'jocelyn', 'josephine', 'joy', 'joyce', 'judith', 'judy', 'julia', 'juliana', 'julie',
        'juliet', 'justine', 'karen', 'karla', 'kate', 'katelyn', 'katherine', 'kathleen',
        'kathryn', 'katrina', 'kayla', 'kelly', 'kendra', 'kim', 'kimberly', 'kirsten', 'kristel',
        'kristen', 'kristin', 'kristina', 'kristine', 'krystal', 'kyla', 'kylie', 'lara', 'larissa',
        'laura', 'lauren', 'leah', 'leanne', 'leslie', 'lianne', 'lillian', 'lily', 'linda',
        'lindsay', 'lisa', 'liza', 'loraine', 'lorraine', 'louise', 'lucia', 'lucy', 'lydia',
        'lyka', 'lyn', 'lynn', 'madeline', 'madison', 'mae', 'maggie', 'mara', 'margaret',
        'maria', 'marian', 'marianne', 'marie', 'mariel', 'marielle', 'marilyn', 'marisol',
        'marissa', 'marjorie', 'martha', 'mary', 'maya', 'megan', 'melanie', 'melissa', 'melody',
        'mia', 'michaela', 'michele', 'michelle', 'mika', 'mikaela', 'miriam', 'molly', 'monica',
        'nadine', 'nancy', 'natalie', 'natasha', 'nicole', 'nikki', 'nina', 'noelle', 'nora',
        'olivia', 'paige', 'pamela', 'patricia', 'paula', 'pauline', 'pearl', 'penelope',
        'phoebe', 'pia', 'precious', 'princess', 'priscilla', 'rachel', 'rachelle', 'raquel',
        'rebecca', 'regina', 'regine', 'rica', 'riley', 'rita', 'roberta', 'rochelle', 'rosa',
        'rosalie', 'rose', 'rosemarie', 'rosemary', 'roxanne', 'ruby', 'ruth', 'sabrina',
        'samantha', 'sandra', 'sara', 'sarah', 'savannah', 'scarlett', 'selena', 'serena',
        'shaina', 'shane', 'shannon', 'sharon', 'sheena', 'sheila', 'shelly', 'sheryl',
        'shirley', 'sienna', 'sofia', 'sonia', 'sophia', 'sophie', 'stacey', 'stacy', 'stella',
        'stephanie', 'susan', 'suzanne', 'sydney', 'sylvia', 'tanya', 'tara', 'tasha', 'teresa',
        'tessa', 'theresa', 'therese', 'tiffany', 'tina', 'tracy', 'tricia', 'trisha', 'valerie',
        'vanessa', 'vera', 'veronica', 'victoria', 'violet', 'virginia', 'vivian', 'wendy',
        'whitney', 'yna', 'yvonne', 'zoe', 'zoey',
    ];

    private const MALE_NAMES = [
        'aaron', 'abel', 'abraham', 'adam', 'adrian', 'alain', 'alan', 'albert', 'aldrin', 'alec',
        'alejandro', 'alex', 'alexander', 'alfonso', 'alfred', 'allan', 'allen', 'alvin', 'andre',
        'andrei', 'andres', 'andrew', 'andy', 'angel', 'angelo', 'anthony', 'anton', 'antonio',
        'archie', 'arnold', 'arthur', 'asher', 'austin', 'axel', 'ben', 'benjamin', 'bernard',
        'billy', 'blake', 'bobby', 'brad', 'bradley', 'brandon', 'brent', 'brett', 'brian',
        'brody', 'bruce', 'bruno', 'bryan', 'bryce', 'byron', 'caleb', 'calvin', 'cameron',
        'carl', 'carlo', 'carlos', 'carter', 'cedric', 'cesar', 'chad', 'charles', 'charlie',
        'chase', 'chris', 'christian', 'christopher', 'clarence', 'clark', 'clayton', 'clifford',
        'clint', 'clyde', 'cody', 'cole', 'colin', 'connor', 'cooper', 'corey', 'craig', 'cristian',
        'curtis', 'cyrus', 'dale', 'damian', 'damon', 'dan', 'daniel', 'danny', 'dante', 'darius',
        'darren', 'darryl', 'dave', 'david', 'dean', 'dennis', 'derek', 'devon', 'dexter',
        'diego', 'domingo', 'dominic', 'don', 'donald', 'donovan', 'dorian', 'douglas', 'drake',
        'drew', 'dustin', 'dwayne', 'dylan', 'earl', 'eddie', 'edgar', 'edison', 'edmund',
        'eduardo', 'edward', 'edwin', 'eli', 'elias', 'elijah', 'elliot', 'elliott', 'elmer',
        'emanuel', 'emil', 'emilio', 'emmanuel', 'enrique', 'enzo', 'eric', 'erick', 'erik',
        'ernest', 'ernesto', 'ethan', 'eugene', 'evan', 'ezekiel', 'fabian', 'felix', 'fernando',
        'francis', 'francisco', 'franco', 'frank', 'franklin', 'fred', 'frederick', 'gabriel',
        'gael', 'garrett', 'gary', 'gavin', 'gene', 'geoffrey', 'george', 'gerald', 'gerard',
        'gerardo', 'gideon', 'gilbert', 'giovanni', 'glen', 'glenn', 'gordon', 'graham', 'grant',
        'greg', 'gregory', 'griffin', 'guillermo', 'gustavo', 'harold', 'harrison', 'harry',
        'harvey', 'hector', 'henry', 'herbert', 'herman', 'howard', 'hudson', 'hugo', 'hunter',
        'ian', 'ignacio', 'isaac', 'isaiah', 'israel', 'ivan', 'jack', 'jackson', 'jacob',
        'jaime', 'jake', 'james', 'jamie', 'jared', 'jason', 'jasper', 'javier', 'jay', 'jayden',
        'jeff', 'jeffrey', 'jeremiah', 'jeremy', 'jericho', 'jerome', 'jerry', 'jesse', 'jesus',
        'jethro', 'jimmy', 'joaquin', 'joe', 'joel', 'joey', 'johan', 'john', 'johnny', 'jonah',
        'jonas', 'jonathan', 'jordan', 'jorge', 'jose', 'joseph', 'josh', 'joshua', 'josiah',
        'juan', 'jude', 'julian', 'julio', 'julius', 'justin', 'karl', 'keith', 'ken', 'kenneth',
        'kent', 'kevin', 'khalid', 'kieran', 'kirk', 'kobe', 'kris', 'kristian', 'kurt', 'kyle',
        'lance', 'landon', 'larry', 'laurence', 'lawrence', 'leandro', 'lee', 'leo', 'leon',
        'leonard', 'leonardo', 'levi', 'liam', 'lincoln', 'lloyd', 'logan', 'lorenzo', 'louis',
        'lucas', 'luis', 'luke', 'malcolm', 'manuel', 'marc', 'marcel', 'marcelo', 'marco',
        'marcos', 'marcus', 'mario', 'mark', 'marshall', 'martin', 'marvin', 'mason', 'mateo',
        'mathew', 'matthew', 'maurice', 'max', 'maxwell', 'melvin', 'michael', 'miguel', 'mike',
        'miles', 'milo', 'mitchell', 'mohammed', 'morgan', 'moses', 'nathan', 'nathaniel', 'neil',
        'nelson', 'nicholas', 'nick', 'nico', 'nicolas', 'nigel', 'noah', 'noel', 'nolan',
        'norman', 'oliver', 'omar', 'orlando', 'oscar', 'owen', 'pablo', 'paolo', 'parker',
        'patrick', 'paul', 'pedro', 'perry', 'peter', 'philip', 'phillip', 'preston', 'quentin',
        'rafael', 'ralph', 'ramon', 'randall', 'randy', 'raphael', 'raul', 'ray', 'raymond',
        'raymund', 'reggie', 'reid', 'remy', 'rene', 'renz', 'renzo', 'rex', 'reynaldo',
        'ricardo', 'richard', 'rick', 'ricky', 'riley', 'rob', 'robert', 'roberto', 'robin',
        'rocco', 'rodney', 'rodrigo', 'roger', 'roland', 'rolando', 'roman', 'romeo', 'ron',
        'ronald', 'ronan', 'ronnie', 'ross', 'roy', 'ruben', 'rudy', 'rupert', 'russell',
        'ryan', 'sam', 'samuel', 'sanji', 'santiago', 'saul', 'scott', 'sean', 'sebastian',
        'sergio', 'seth', 'shane', 'shaun', 'shawn', 'simon', 'solomon', 'spencer', 'stanley',
        'stefan', 'stephen', 'steve', 'steven', 'stewart', 'stuart', 'ted', 'terence',
        'terrance', 'terrence', 'terry', 'theo', 'theodore', 'thomas', 'tim', 'timothy', 'titus',
        'tobias', 'toby', 'todd', 'tom', 'tomas', 'tommy', 'tony', 'travis', 'trevor', 'tristan',
        'troy', 'tucker', 'tyler', 'tyson', 'ulysses', 'vhan', 'victor', 'vince', 'vincent',
        'virgil', 'wade', 'wallace', 'walter', 'warren', 'wayne', 'wendell', 'wesley', 'weston',
        'wilbur', 'wilfred', 'will', 'william', 'willie', 'wilson', 'winston', 'wyatt', 'xander',
        'xavier', 'zach', 'zachary', 'zane',
    ];

    /**
     * Seed realistic gender-matched portrait avatars into PostgreSQL stored_files
     * for students/graduates/jobseekers missing an accessible avatar image.
     */
    public function run(): array
    {
        if (!Schema::hasTable('users') || !Schema::hasTable('stored_files')) {
            return ['updated' => 0, 'skipped' => 0];
        }

        $assetDir = database_path('seeders/assets/portraits');
        if (!is_dir($assetDir)) {
            return ['updated' => 0, 'skipped' => 0];
        }

        $womenFiles = glob($assetDir . DIRECTORY_SEPARATOR . 'women_*.jpg') ?: [];
        $menFiles   = glob($assetDir . DIRECTORY_SEPARATOR . 'men_*.jpg') ?: [];
        natsort($womenFiles);
        natsort($menFiles);
        $womenFiles = array_values($womenFiles);
        $menFiles   = array_values($menFiles);

        if (empty($womenFiles) && empty($menFiles)) {
            return ['updated' => 0, 'skipped' => 0];
        }

        $users = User::whereIn('role', ['student', 'graduate', 'jobseeker'])
            ->orderBy('id')
            ->get();

        PersistentFileService::preloadPaths($users->pluck('avatar_url')->all());

        $womenIdx = 0;
        $menIdx   = 0;
        $updated  = 0;
        $skipped  = 0;

        foreach ($users as $user) {
            $rawAvatar = trim((string) ($user->avatar_url ?? ''));

            // Preserve valid external avatars (e.g. Google OAuth) or existing persisted files
            if ($rawAvatar !== '') {
                $normalized = PersistentFileService::normalizePath($rawAvatar);
                if ($normalized === null || PersistentFileService::exists($normalized)) {
                    $skipped++;
                    continue;
                }
            }

            $gender = $this->inferGender($user);
            if ($gender === 'women' && !empty($womenFiles)) {
                $portraitFile = $womenFiles[$womenIdx % count($womenFiles)];
                $womenIdx++;
            } elseif (!empty($menFiles)) {
                $portraitFile = $menFiles[$menIdx % count($menFiles)];
                $menIdx++;
            } else {
                $portraitFile = $womenFiles[$womenIdx % count($womenFiles)];
                $womenIdx++;
            }

            $binary = @file_get_contents($portraitFile);
            if ($binary === false || $binary === '') {
                $skipped++;
                continue;
            }

            // Reuse existing /storage/... path when present so cached URLs immediately resolve
            $existingRelative = PersistentFileService::normalizePath($rawAvatar);
            $targetRelative   = $existingRelative ?: "student-avatars/portrait_student_{$user->id}.jpg";

            PersistentFileService::put($targetRelative, $binary, 'image/jpeg');

            $expectedUrl = '/storage/' . $targetRelative;
            if ($user->avatar_url !== $expectedUrl) {
                $user->update(['avatar_url' => $expectedUrl]);
            }

            $updated++;
        }

        return ['updated' => $updated, 'skipped' => $skipped];
    }

    private function inferGender(User $user): string
    {
        $source = trim((string) ($user->first_name ?: $user->name));
        $firstToken = strtolower(preg_replace('/[^a-z]/i', '', explode(' ', $source)[0] ?? '') ?? '');

        if ($firstToken !== '') {
            if (in_array($firstToken, self::FEMALE_NAMES, true)) {
                return 'women';
            }
            if (in_array($firstToken, self::MALE_NAMES, true)) {
                return 'men';
            }
            return (crc32($firstToken) % 2 === 0) ? 'women' : 'men';
        }

        return ($user->id % 2 === 0) ? 'women' : 'men';
    }
}
