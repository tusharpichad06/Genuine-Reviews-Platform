import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import Review from "./pages/Review";
import WriteReview from "./pages/WriteReview";

import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ReviewDetails from "./pages/ReviewDetails";
import Auth from "@/pages/Auth";
import Categories from "./pages/Categories";
import CategoryReviews from "./pages/CategoryReviews";
import SavedReviews from "./pages/SavedReviews";
import { Toaster } from "sonner";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReviews from "./pages/AdminReviews";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminRoute from "./components/AdminRoute";
import ActivityTracker from "./components/ActivityTracker";
import ScrollToTop from "./components/ScrollToTop";
import LatestReviewsPage from "./pages/LatestReviewsPage";
import TrendingReviewsPage from "./pages/TrendingReviewsPage";
import TopReviewsPage from "./pages/TopReviewsPage";
import AllReviews from "./pages/AllReviews";
import Guidelines from "./pages/Guidelines";
import ContactUs from "./pages/ContactUs";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPassword from "@/pages/ResetPassword";

import Businesses from "./pages/Businesses";
import BusinessProfile from "./pages/BusinessProfile";
import CreateBusinessProfile from "./pages/CreateBusinessProfile";
import EditBusinessProfile from "./pages/EditBusinessProfile";
import Proposals from "./pages/Proposals";
import ProposalDetails from "./pages/ProposalDetails";
import Deals from "./pages/Deals";
import DealDetails from "./pages/DealDetails";
import AdminBusinesses from "./pages/AdminBusinesses";
import AdminProposals from "./pages/AdminProposals";
import AdminDeals from "./pages/AdminDeals";

function App() {
  return (
    <>
      <ActivityTracker />

      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/write-review"
          element={<WriteReview />}
        />

        <Route
          path="/search"
          element={<SearchResults />}
        />

        <Route
          path="/profile/saved-reviews"
          element={<SavedReviews />}
        />

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/reviews"
            element={<AdminReviews />}
          />

          <Route
            path="/admin/reports"
            element={<AdminReports />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />
        </Route>

        <Route
          path="/review"
          element={<Review />}
        />

        <Route
          path="/review/:id"
          element={<ReviewDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/profile/:username"
          element={<Profile />}
        />

        <Route
          path="/auth"
          element={<Auth />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/categories/:category"
          element={<CategoryReviews />}
        />

        <Route
          path="/latest-reviews"
          element={<LatestReviewsPage />}
        />

        <Route
          path="/trending-reviews"
          element={<TrendingReviewsPage />}
        />

        <Route
          path="/top-reviews"
          element={<TopReviewsPage />}
        />

        <Route
          path="/reviews"
          element={<AllReviews />}
        />

        <Route
          path="/guidelines"
          element={<Guidelines />}
        />

        <Route
          path="/contact"
          element={<ContactUs />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms"
          element={<TermsConditions />}
        />

        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPasswordForm />
            </AuthLayout>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/business/create"
          element={<CreateBusinessProfile />}
        />

        <Route
          path="/businesses"
          element={<Businesses />}
        />

        <Route
          path="/business/:businessId"
          element={<BusinessProfile />}
        />

        <Route
          path="/business/edit"
          element={<EditBusinessProfile />}
        />

        {/* Proposals Routes */}
        <Route
          path="/proposals"
          element={<Proposals />}
        />

        <Route
          path="/proposals/:proposalId"
          element={<ProposalDetails />}
        />

        <Route
          path="/deals/:dealId"
          element={<DealDetails />}
        />

        <Route
          path="/deals"
          element={<Deals />}
        />

        <Route
          path="/admin/businesses"
          element={<AdminBusinesses />}
        />

        <Route
          path="/admin/proposals"
          element={<AdminProposals />}
        />

        <Route
          path="/admin/deals"
          element={<AdminDeals />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;