<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of dashboard.   
     */
    public function index()
    {
        return Inertia::render('dashboard');
    }
}
