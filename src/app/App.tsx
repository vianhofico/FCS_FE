import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/shared/context/AuthContext";
import { router } from "@/app/router/router";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
