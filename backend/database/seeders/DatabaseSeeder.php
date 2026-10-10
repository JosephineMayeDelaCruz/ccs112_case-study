<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\PickingOrder;
use App\Models\PickingOrderLine;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Safe to run twice — use firstOrCreate / updateOrCreate throughout

        // ---------- Settings defaults ----------
        Setting::firstOrCreate(['key' => 'lowStockAlerts'],   ['value' => 'true']);
        Setting::firstOrCreate(['key' => 'expiryAlerts'],     ['value' => 'true']);
        Setting::firstOrCreate(['key' => 'smsNotifications'], ['value' => 'false']);
        Setting::firstOrCreate(['key' => 'autoGeneratePO'],   ['value' => 'false']);

        // ---------- Users ----------
        $staff = User::firstOrCreate(['email' => 'staff@walangbrownout.test'], [
            'name'           => 'V. Devera',
            'password'       => Hash::make('password'),
            'role'           => 'staff',
            'status'         => 'Active',
            'last_active_at' => now(),
        ]);

        $admin = User::firstOrCreate(['email' => 'admin@walangbrownout.test'], [
            'name'           => 'A. Reyes',
            'password'       => Hash::make('password'),
            'role'           => 'admin',
            'status'         => 'Active',
            'last_active_at' => now(),
        ]);

        $manager = User::firstOrCreate(['email' => 'manager@walangbrownout.test'], [
            'name'           => 'J. Dela Cruz',
            'password'       => Hash::make('password'),
            'role'           => 'manager',
            'status'         => 'Active',
            'last_active_at' => now()->subDay(),
        ]);

        $clerk = User::firstOrCreate(['email' => 'clerk@walangbrownout.test'], [
            'name'           => 'M. Dalmaciouno',
            'password'       => Hash::make('password'),
            'role'           => 'products',
            'status'         => 'Active',
            'last_active_at' => now(),
        ]);

        User::firstOrCreate(['email' => 'rdegracia@walangbrownout.test'], [
            'name'           => 'R. De Gracia',
            'password'       => Hash::make('password'),
            'role'           => 'staff',
            'status'         => 'Inactive',
            'last_active_at' => now()->subDays(3),
        ]);

        // ---------- Products ----------
        $thermostat = Product::firstOrCreate(['name' => 'Smart Thermostat'], [
            'sku'      => 'THM-S1',
            'category' => 'Thermostat',
            'qty'      => 24,
            'price'    => 8499,
        ]);

        $filter = Product::firstOrCreate(['name' => 'Air Purifier Filter'], [
            'sku'      => 'APF-001',
            'category' => 'Air Purifier',
            'qty'      => 56,   // sum of batches below
            'price'    => 9479,
        ]);

        Product::firstOrCreate(['name' => 'Portable AC 9k'], [
            'sku'      => 'AC-P9K',
            'category' => 'Air Conditioner',
            'qty'      => 13,
            'price'    => 13479,
        ]);

        $ac12k = Product::firstOrCreate(['name' => 'Portable AC 12k'], [
            'sku'      => 'AC-P12K',
            'category' => 'Air Conditioner',
            'qty'      => 3,
            'price'    => 23479,
        ]);

        Product::firstOrCreate(['name' => 'Ceiling Fan 52-inch'], [
            'sku'      => 'CF-52',
            'category' => 'Electric Fan',
            'qty'      => 18,
            'price'    => 2999,
        ]);

        Product::firstOrCreate(['name' => 'Humidifier L2'], [
            'sku'      => 'HUM-L2',
            'category' => 'Humidifier',
            'qty'      => 12,
            'price'    => 5999,
        ]);

        // ---------- Batches (with expiry dates) ----------
        Batch::firstOrCreate(['code' => 'B-101'], [
            'product_id'    => $filter->id,
            'product_label' => $filter->name,
            'received_date' => '2026-04-02',
            'expiry_date'   => '2027-04-02',
            'qty'           => 12,
        ]);

        Batch::firstOrCreate(['code' => 'B-108'], [
            'product_id'    => $filter->id,
            'product_label' => $filter->name,
            'received_date' => '2026-05-20',
            'expiry_date'   => '2027-05-20',
            'qty'           => 24,
        ]);

        Batch::firstOrCreate(['code' => 'B-114'], [
            'product_id'    => $filter->id,
            'product_label' => $filter->name,
            'received_date' => '2026-06-30',
            'expiry_date'   => '2027-06-30',
            'qty'           => 20,
        ]);

        // ---------- Sample stock movements ----------
        if (StockMovement::count() === 0) {
            StockMovement::create(['product_id' => $filter->id,     'product_label' => $filter->name,     'type' => 'received',    'qty' => '+48', 'status' => 'ok',   'user_id' => $staff->id]);
            StockMovement::create(['product_id' => null,            'product_label' => 'AC-Port-12k',     'type' => 'sold',        'qty' => '-2',  'status' => 'ok',   'user_id' => $staff->id]);
            StockMovement::create(['product_id' => $thermostat->id, 'product_label' => $thermostat->name, 'type' => 'adjusted',    'qty' => '-1',  'status' => 'flag', 'user_id' => $staff->id]);
            StockMovement::create(['product_id' => $filter->id,     'product_label' => $filter->name,     'type' => 'transferred', 'qty' => '-10', 'status' => 'ok',   'user_id' => $staff->id]);
            StockMovement::create(['product_id' => null,            'product_label' => 'Purifier P-4',    'type' => 'returned',    'qty' => '+1',  'status' => 'ok',   'user_id' => $staff->id]);
        }

        // ---------- Suppliers ----------
        $coolAir      = Supplier::firstOrCreate(['name' => 'CoolAir Distribution'],  ['contact' => 'sales@coolair.ph',    'lead_time' => '5 days',  'rating' => 'Preferred']);
        $manilaThermo = Supplier::firstOrCreate(['name' => 'Manila Thermo Supply'],  ['contact' => 'orders@manilathermo.ph', 'lead_time' => '7 days', 'rating' => 'Standard']);
        $breeze       = Supplier::firstOrCreate(['name' => 'Breeze Components Co.'], ['contact' => 'hello@breezeco.ph',   'lead_time' => '10 days', 'rating' => 'Standard']);

        // ---------- Purchase Orders ----------
        PurchaseOrder::firstOrCreate(['code' => 'PO-1040'], ['supplier_id' => $coolAir->id,      'supplier_label' => $coolAir->name,      'items' => 6,  'total' => 128400, 'status' => 'Pending']);
        PurchaseOrder::firstOrCreate(['code' => 'PO-1041'], ['supplier_id' => $manilaThermo->id, 'supplier_label' => $manilaThermo->name, 'items' => 3,  'total' => 42900,  'status' => 'Approved']);
        PurchaseOrder::firstOrCreate(['code' => 'PO-1042'], ['supplier_id' => $breeze->id,       'supplier_label' => $breeze->name,       'items' => 10, 'total' => 215600, 'status' => 'Approved']);

        // ---------- Purchase Requests ----------
        PurchaseRequest::firstOrCreate(['code' => 'PR-330'], ['requested_by' => $clerk->id,   'requested_by_label' => $clerk->name,   'item' => 'Carbon Filter Cartridge', 'qty' => 100, 'status' => 'Pending review']);
        PurchaseRequest::firstOrCreate(['code' => 'PR-331'], ['requested_by' => $staff->id,   'requested_by_label' => $staff->name,   'item' => 'Portable AC 9k',          'qty' => 25,  'status' => 'Pending review']);
        PurchaseRequest::firstOrCreate(['code' => 'PR-329'], ['requested_by' => $manager->id, 'requested_by_label' => $manager->name, 'item' => 'Smart Thermostat',        'qty' => 40,  'status' => 'Converted to PO']);

        // ---------- Picking Orders ----------
        if (PickingOrder::count() === 0) {
            $po1 = PickingOrder::create(['code' => '#000019', 'customer' => 'Northgate Appliances', 'status' => 'Fulfilled', 'fulfilled_at' => now()->subHours(2)]);
            PickingOrderLine::create(['picking_order_id' => $po1->id, 'product_id' => $filter->id, 'product_label' => $filter->name, 'qty' => 12, 'picked_qty' => 12]);

            $po2 = PickingOrder::create(['code' => '#000025', 'customer' => 'ABC Hardware', 'status' => 'Pending']);
            PickingOrderLine::create(['picking_order_id' => $po2->id, 'product_id' => $filter->id, 'product_label' => $filter->name, 'qty' => 20, 'picked_qty' => 0]);

            $po3 = PickingOrder::create(['code' => '#000026', 'customer' => 'Metro Cooling Supplies', 'status' => 'Pending']);
            PickingOrderLine::create(['picking_order_id' => $po3->id, 'product_id' => $filter->id,    'product_label' => $filter->name,    'qty' => 20, 'picked_qty' => 0]);
            PickingOrderLine::create(['picking_order_id' => $po3->id, 'product_id' => $thermostat->id,'product_label' => $thermostat->name,'qty' => 10, 'picked_qty' => 0]);
            PickingOrderLine::create(['picking_order_id' => $po3->id, 'product_id' => $ac12k->id,    'product_label' => $ac12k->name,     'qty' => 3,  'picked_qty' => 0]);
        }

        // ---------- Audit Logs ----------
        if (AuditLog::count() === 0) {
            AuditLog::create(['user_id' => $admin->id,   'user_label' => $admin->name,   'action' => "Updated reorder threshold for {$ac12k->name}"]);
            AuditLog::create(['user_id' => $manager->id, 'user_label' => $manager->name, 'action' => 'Approved PO-1042']);
            AuditLog::create(['user_id' => null,         'user_label' => 'System',        'action' => "Auto-flagged stock mismatch on {$thermostat->name}"]);
        }
    }
}
