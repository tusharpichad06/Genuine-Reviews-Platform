import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        // Check current logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Not logged in
        if (!user) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        // Ask Supabase whether this user is an admin
        const { data, error } = await supabase.rpc("is_admin");

        if (error) {
          console.error("IS ADMIN CHECK ERROR:", error);

          if (mounted) {
            setIsAdmin(false);
          }

          return;
        }

        if (mounted) {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error("ADMIN ROUTE ERROR:", error);

        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  // While checking Supabase
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking permissions...
        </p>
      </div>
    );
  }

  // Not admin → homepage
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin → allow protected route
  return <Outlet />;
}

export default AdminRoute;