"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react"; // signIn을 사용하는 경우
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isPending, setIsPending] = useState<boolean>(false);
  const router = useRouter();

  const authenticate = async (formData: FormData) => {
    try {
      setIsPending(true);
      // 자격 증명 객체 생성
      const credentials = {
        email: formData.get("email")?.toString(),
        password: formData.get("password")?.toString(),
      };

      // 'credentials' provider를 사용하여 signIn 호출
      const response = await signIn("credentials", {
        redirect: false,
        ...credentials,
      });

      // 인증 실패 처리
      if (response?.error) {
        switch (response.error) {
          case "CredentialsSignin":
            setErrorMessage("Invalid credentials.");
            break;
          default:
            setErrorMessage("Something went wrong.");
            break;
        }
      } else {
        setErrorMessage(undefined); // 성공 시 에러 메시지 초기화
        // 성공적으로 로그인되었을 때 추가적인 동작을 여기에서 처리
        console.log("Login successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
      console.error("Authentication failed", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        authenticate(formData); // authenticate 함수 호출
      }}
    >
      <div>
        <label>Email</label>
        <input name="email" type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input name="password" type="password" required />
      </div>

      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
