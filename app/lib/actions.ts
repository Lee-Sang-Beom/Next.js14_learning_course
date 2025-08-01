"use server";

import { sql } from "@vercel/postgres";
import { signIn } from "next-auth/react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type State = {
  errors?: {
    customerId?: string[]; // 'customerId'에 대한 오류 메시지를 배열로 저장할 수 있음.
    amount?: string[]; // 'amount'에 대한 오류 메시지를 배열로 저장할 수 있음.
    status?: string[]; // 'status'에 대한 오류 메시지를 배열로 저장할 수 있음.
  };
  message?: string | null; // 메시지는 문자열이거나 null일 수 있음.
};

const FormSchema = z.object({
  id: z.string(), // id는 문자열이어야 한다.
  customerId: z.string({
    // customerId는 문자열이어야 한다.
    invalid_type_error: "Please select a customer.", // 'customerId' 필드가 비어있으면 '고객을 선택하세요'라는 메시지를 출력함.
  }), // customerId는 문자열이어야 한다.
  amount: z.coerce
    .number() // amount는 coerce에 의해 number 타입으로 강제변환한다. ("100" -> 100)
    .gt(0, { message: "Please enter an amount greater than $0." }), // 값이 0보다 큰 숫자여야 하며, 그렇지 않으면 '0보다 큰 금액을 입력하세요'라는 메시지를 출력함.

  status: z.enum(["pending", "paid"], {
    // 'status' 필드는 'pending' 또는 'paid' 값 중 하나를 가져야 함.
    invalid_type_error: "Please select an invoice status.", // 값이 없거나 올바르지 않으면 '송장 상태를 선택하세요'라는 메시지를 출력함.
  }),
  date: z.string(), // date는 문자열이어야 한다.
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Zod를 사용하여 폼 필드를 검증합니다.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // 폼 검증에 실패하면, 오류를 반환하고 함수를 조기에 종료합니다. 그렇지 않으면 계속 진행합니다.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // 데이터베이스에 삽입할 데이터를 준비합니다.
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // 금액을 센트 단위로 변환
  const date = new Date().toISOString().split("T")[0]; // 현재 날짜를 ISO 형식으로 변환

  // 데이터를 데이터베이스에 삽입합니다.
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // build 시 err발생 (Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars)
    console.error(error);

    // 데이터베이스 오류 발생 시, 특정 오류 메시지를 반환합니다.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // 청구서 페이지의 캐시를 다시 검증하고, 사용자에게 리다이렉션합니다.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Zod를 사용하여 예상되는 타입 정의
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    // build 시 err발생 (Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars)
    console.error(error);
    return {
      message: "DB Error : Faileed to Update Invoice" + error,
    };
  }

  // 클라이언트 캐시 무효화 및 서버 요청 갱신
  revalidatePath("/dashboard/invoices");
  // 업데이트 후 인보이스 페이지로 리다이렉트
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    // return 문 제거
  } catch (error) {
    console.error("Database Error: Failed to Delete Invoice.", error);
    throw new Error("Failed to delete invoice"); // return 대신 throw
  }
}

export async function authenticate(
  prevState: string | undefined, // 이전 상태
  formData: FormData // 로그인 폼 데이터
) {
  try {
    // Create an object with the necessary credentials
    const credentials = {
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    };

    // Call signIn with 'credentials' provider and the extracted form data
    const response = await signIn("credentials", {
      redirect: false, // To prevent redirection after sign-in
      ...credentials, // Spread credentials into the options
    });

    // Check for authentication failure
    if (response?.error) {
      switch (response.error) {
        case "CredentialsSignin": // 자격 증명이 잘못된 경우
          return "Invalid credentials."; // 잘못된 자격 증명 메시지 반환
        default:
          return "Something went wrong."; // 기타 오류
      }
    }

    return "Success"; // 로그인 성공 메시지 반환 (필요에 따라 변경)
  } catch (error) {
    console.error("Authentication failed", error);
    return "Something went wrong."; // 예외 발생 시 메시지 반환
  }
}
