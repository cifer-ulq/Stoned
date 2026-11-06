<?php

namespace App\Services;

use Carbon\Carbon;

class HolidayService
{
    /**
     * Common Philippine Regular Holidays & Special Non-Working Days
     * Focus on the OJT term (January to July) with multi-year movable holiday calculations.
     */
    public static function getHolidayName(Carbon $date): ?string
    {
        $year  = $date->year;
        $md    = $date->format('m-d');
        $ymd   = $date->format('Y-m-d');

        // Fixed-date Philippine National Holidays
        $fixedHolidays = [
            '01-01' => "New Year's Day",
            '01-02' => "Special Non-Working Holiday",
            '02-25' => "People Power Revolution Anniversary",
            '04-09' => "Araw ng Kagitingan (Day of Valor)",
            '05-01' => "Labor Day",
            '06-12' => "Philippine Independence Day",
            '08-21' => "Ninoy Aquino Day",
            '08-31' => "National Heroes Day", // (approx late Aug)
            '11-01' => "All Saints' Day",
            '11-02' => "All Souls' Day",
            '11-30' => "Bonifacio Day",
            '12-08' => "Feast of the Immaculate Conception",
            '12-25' => "Christmas Day",
            '12-30' => "Rizal Day",
            '12-31' => "Last Day of the Year",
        ];

        if (isset($fixedHolidays[$md])) {
            return $fixedHolidays[$md];
        }

        // Movable Religious & Cultural Holidays by Year (2025 - 2027)
        $movableHolidays = [
            // 2025
            '2025-01-29' => 'Chinese New Year',
            '2025-03-31' => 'Eid al-Fitr',
            '2025-04-17' => 'Maundy Thursday',
            '2025-04-18' => 'Good Friday',
            '2025-04-19' => 'Black Saturday',
            '2025-06-06' => 'Eid al-Adha',

            // 2026 (Active Platform Year)
            '2026-02-17' => 'Chinese New Year',
            '2026-03-20' => 'Eid al-Fitr',
            '2026-04-02' => 'Maundy Thursday',
            '2026-04-03' => 'Good Friday',
            '2026-04-04' => 'Black Saturday',
            '2026-05-27' => 'Eid al-Adha',

            // 2027
            '2027-02-06' => 'Chinese New Year',
            '2027-03-10' => 'Eid al-Fitr',
            '2027-03-25' => 'Maundy Thursday',
            '2027-03-26' => 'Good Friday',
            '2027-03-27' => 'Black Saturday',
            '2027-05-17' => 'Eid al-Adha',
        ];

        return $movableHolidays[$ymd] ?? null;
    }

    /**
     * Check if a given date is an official holiday
     */
    public static function isHoliday(Carbon $date): bool
    {
        return static::getHolidayName($date) !== null;
    }
}
