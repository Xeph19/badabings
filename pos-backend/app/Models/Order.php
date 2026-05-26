<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_type', 'status', 'total', 'customer_name', 'notes',
        'discount_id', 'discount_name', 'discount_percent',
        'gross_amount', 'discount_amount', 'net_amount',
        'refund_amount', 'cost_of_goods',
    ];

    protected $casts = [
        'total'           => 'decimal:2',
        'gross_amount'    => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount'      => 'decimal:2',
        'refund_amount'   => 'decimal:2',
        'cost_of_goods'   => 'decimal:2',
        'discount_percent'=> 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }
}
