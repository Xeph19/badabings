<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueOverride extends Model
{
    use HasFactory;

    protected $fillable = ['period_date', 'period_type', 'override_amount', 'note'];

    protected $casts = [
        'override_amount' => 'decimal:2',
    ];
}
