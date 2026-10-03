<?php

namespace App\Services;

class RecommendationService
{
    /**
     * Recommendation thresholds:
     * - 71% and above: Highly Recommended
     * - 26% to 70%: Recommended
     * - 25% and below: Not Recommended
     *
     * @param int|float|null $score
     * @return array{tier: string, label: string, short_label: string}
     */
    public static function classify($score): array
    {
        $num = (int) round(max(0, min(100, (float) ($score ?? 0))));

        if ($num >= 71) {
            return [
                'tier'        => 'highly_recommended',
                'label'       => 'HIGHLY RECOMMENDED',
                'short_label' => 'Highly Recommended',
            ];
        }

        if ($num > 25) {
            return [
                'tier'        => 'recommended',
                'label'       => 'RECOMMENDED',
                'short_label' => 'Recommended',
            ];
        }

        return [
            'tier'        => 'not_recommended',
            'label'       => 'NOT RECOMMENDED',
            'short_label' => 'Not Recommended',
        ];
    }

    /**
     * Recommendation for external partner jobs:
     * All external partner listings are classified as Highly Recommended and do not display a match percentage.
     *
     * @return array{tier: string, label: string, short_label: string, is_external: bool}
     */
    public static function forExternalJob(): array
    {
        return [
            'tier'        => 'highly_recommended',
            'label'       => 'HIGHLY RECOMMENDED',
            'short_label' => 'Highly Recommended',
            'is_external' => true,
        ];
    }
}

