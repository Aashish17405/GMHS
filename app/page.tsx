"use client";

import React, { useState } from "react";
import Register from "@/components/Register";
import Login from "@/components/Login";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  const [loginMode, setLoginMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOWZhZmIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative w-full max-w-md">
        {/* Company/Brand Header */}

        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <div
                className={`h-1 w-8 rounded-full transition-colors duration-200 ${
                  loginMode ? "bg-primary" : "bg-muted"
                }`}
              ></div>
              <div
                className={`h-1 w-8 rounded-full transition-colors duration-200 ${
                  !loginMode ? "bg-primary" : "bg-muted"
                }`}
              ></div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {loginMode ? (
              <Login setLoginMode={setLoginMode} />
            ) : (
              <Register setLoginMode={setLoginMode} />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2025 Enterprise Portal. All rights reserved.</p>
          <p className="mt-1">Secure • Professional • Reliable</p>
        </div>
      </div>
    </div>
  );
}
