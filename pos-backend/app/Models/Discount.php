<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'percentage', 'is_active'];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_active'  => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
