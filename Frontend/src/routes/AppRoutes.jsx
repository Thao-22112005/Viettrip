import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";

import TourList from "../pages/Tours/TourList";
import TourDetail from "../pages/Tours/TourDetail";

import Booking from "../pages/Booking/Booking";
import Payment from "../pages/Payment/Payment";
import BookingSuccess from "../pages/BookingSuccess/BookingSuccess";

import BookingList from "../pages/Bookings/BookingList";
import BookingDetail from "../pages/BookingDetail/BookingDetail";

import Review from "../pages/Review/Review";

import Destination from "../pages/Destination/Destination";
import DestinationDetail from "../pages/DestinationDetail/DestinationDetail";

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyOTP from "../pages/Auth/VerifyOTP";

import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import VerifyForgotPassword from "../pages/VerifyForgotPassword/VerifyForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

import Profile from "../pages/Profile/Profile";
import About from "../pages/About/About";

import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import TourManagement from "../pages/Admin/Tours/TourManagement";
import CategoryManagement from "../pages/Admin/Categories/CategoryManagement";
import DestinationManagement from "../pages/Admin/Destinations/DestinationManagement";
import BookingManagement from "../pages/Admin/Bookings/BookingManagement";
import PaymentManagement from "../pages/Admin/Payments/PaymentManagement";
import UserManagement from "../pages/Admin/Users/UserManagement";
import ReviewManagement from "../pages/Admin/Reviews/ReviewManagement";
import MediaManagement from "../pages/Admin/Media/MediaManagement";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";

import ProtectedRoute from "../routes/ProtectedRoute";
import AdminRoute from "../routes/AdminRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    USER
                ========================= */}

                <Route element={<MainLayout />}>

                    {/* Trang chủ */}
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    {/* Tour */}
                    <Route
                        path="/tours"
                        element={<TourList />}
                    />

                    <Route
                        path="/tours/:id"
                        element={<TourDetail />}
                    />

                    {/* Booking */}
                    <Route
                        path="/booking"
                        element={<Booking />}
                    />

                    <Route
                        path="/payment"
                        element={<Payment />}
                    />

                    <Route
                        path="/booking-success"
                        element={<BookingSuccess />}
                    />

                    <Route
                        path="/bookings"
                        element={<BookingList />}
                    />

                    <Route
                        path="/bookings/:id"
                        element={<BookingDetail />}
                    />

                    {/* Review */}
                    <Route
                        path="/review"
                        element={<Review />}
                    />

                    {/* Destination */}
                    <Route
                        path="/destinations"
                        element={<Destination />}
                    />

                    <Route
                        path="/destinations/:id"
                        element={<DestinationDetail />}
                    />

                    {/* Auth */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/verify-otp"
                        element={<VerifyOTP />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/forgot-password/verify"
                        element={<VerifyForgotPassword />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    {/* Profile */}
                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    {/* About */}
                    <Route
                        path="/about"
                        element={<About />}
                    />

                </Route>


                {/* =========================
                    ADMIN
                ========================= */}

                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="tours" element={<TourManagement />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="destinations" element={<DestinationManagement />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="payments" element={<PaymentManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="reviews" element={<ReviewManagement />} />
                        <Route path="media" element={<MediaManagement />} />
                        <Route path="profile" element={<AdminProfile />} />
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;