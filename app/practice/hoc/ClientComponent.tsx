"use client";

import React from "react";

// 사용자 데이터 타입 정의
interface IProps {
  userId: string;
  userPswd: string;
  userEmail: string;
  userTelno: string;
}

// HOC에 전달될 Props 타입 정의
interface HOCProps {
  userList: IProps[];
}

// 데이터 검증 및 로깅을 포함한 HOC 생성
const withLoggerAndValidation = (
  WrappedComponent: React.ComponentType<HOCProps>
) => {
  const HOC: React.FC<HOCProps> = (props) => {
    // 데이터 로깅
    console.log("Rendered with userList:", props.userList);

    // 데이터 검증: 유효한 이메일 형식만 허용
    const validatedUsers = props.userList.filter((user) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.userEmail)
    );

    // 모든 데이터가 검증에 통과하지 못했다면 Warning Msg 발생
    if (validatedUsers.length !== props.userList.length) {
      console.warn("WARNING!!! Some users have invalid email addresses.");
    }

    // 검증된 데이터로 WrappedComponent 렌더링
    return <WrappedComponent {...props} userList={validatedUsers} />;
  };

  console.log("WrappedComponent.displayName ", WrappedComponent.displayName); // DisplayNameIsDisplayUserInfoComponent
  console.log("WrappedComponent.name ", WrappedComponent.name); // DisplayUserInfoComponent

  HOC.displayName = `withLoggerAndValidation(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return HOC;
};

// 단순 렌더링을 담당하는 컴포넌트
const DisplayUserInfoComponent: React.FC<HOCProps> = ({ userList }) => {
  return (
    <div style={{ background: "#dbdbdb", padding: "20px" }}>
      {/* 정상적인 email 정보를 가진 유저만 출력됨 */}
      {userList.map((user) => (
        <div
          key={user.userEmail}
          style={{
            margin: "10px 0",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>
            <strong>User ID:</strong> {user.userId}
          </p>
          <p>
            <strong>Password:</strong> {user.userPswd}
          </p>
          <p>
            <strong>Email:</strong> {user.userEmail}
          </p>
          <p>
            <strong>Phone:</strong> {user.userTelno}
          </p>
        </div>
      ))}
    </div>
  );
};
DisplayUserInfoComponent.displayName = "DisplayNameIsDisplayUserInfoComponent";

// HOC로 감싸서 데이터 검증 및 로깅 추가
const EnhancedComponent = withLoggerAndValidation(DisplayUserInfoComponent);

// 최상위 ClientComponent
export default function ClientComponent(props: HOCProps) {
  return (
    <div>
      <h1>User List</h1>
      <EnhancedComponent userList={props.userList} />
    </div>
  );
}
