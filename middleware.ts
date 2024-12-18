import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { redirect } from "next/navigation";

export default withAuth(
  // `middleware` 함수는 사용자의 요청(`req`)을 받아 처리합니다.
  async function middleware(req: NextRequest) {
    // `url` 변수는 요청된 URL 정보를 담고 있습니다.
    const url = req.nextUrl;

    // `token`은 사용자의 세션 정보를 확인하기 위해 `next-auth`의 세션 쿠키에서 가져옵니다. (`next-auth.session-token` 또는 `__Secure-next-auth.session-token`)
    const token =
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token"); // Retrieve token from cookies

    // `isLoggedIn`은 사용자가 로그인했는지를 확인합니다. 세션 토큰이 있으면 `true`, 없으면 `false`가 됩니다.
    const isLoggedIn = !!token;

    // `isOnDashboard`는 사용자가 대시보드 관련 경로(`/dashboard`로 시작하는 URL)를 요청했는지 확인합니다.
    const isOnDashboard = url.pathname.startsWith("/dashboard");

    // 로그인하지않은 사용자 대시보드 접근 방지
    if (isOnDashboard && !isLoggedIn) {
      const loginUrl = new URL("/login", url.origin); // 리다이렉트
      loginUrl.searchParams.set("callbackUrl", url.pathname); // callbackUrl: 로그인 후 돌아올경로 지정
      return NextResponse.redirect(loginUrl);
    }

    // 로그인한 사용자가 대시보드 말고 다른 경로를 요청했으면, 대시보드로 리다이렉트
    if (!isOnDashboard && isLoggedIn) {
      const dashboardUrl = new URL("/dashboard", url.origin);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next(); // 조건에 해당하지 않는 요청은 그대로 허용
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.url.includes("/dashboard")) {
          if (!token || !token.user) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
    },
  }
);

export const config = {
  // 이 미들웨어가 적용될 경로를 정의
  // 대시보드 관련 경로(`/dashboard/*`)뿐만 아니라 전체 경로(`/`)에도 조건을 적용
  matcher: ["/dashboard/:path*", "/:path*"], // Protect dashboard and other paths
};
