<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SkillNormalizer;
use App\Models\SkillsDictionary;

class SkillController extends Controller
{
    /**
     * Get categorized skills taxonomy for client dropdowns and autocomplete.
     */
    public function dictionary(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => SkillNormalizer::getCategorizedTaxonomy(),
            'all'     => SkillNormalizer::all(),
        ]);
    }

    /**
     * Autocomplete search across canonical skills and aliases.
     */
    public function suggest(Request $request)
    {
        $q        = (string) $request->query('q', '');
        $category = $request->query('category');
        $limit    = min(50, max(1, (int) $request->query('limit', 25)));

        $results = SkillNormalizer::search($q, $category, $limit);

        return response()->json([
            'success' => true,
            'data'    => $results,
        ]);
    }

    /**
     * Resolve a raw string or alias to its canonical representation.
     */
    public function resolve(Request $request)
    {
        $skill = (string) $request->query('skill', '');
        $norm  = SkillNormalizer::normalize($skill);

        return response()->json([
            'success' => true,
            'data'    => $norm,
        ]);
    }
}
