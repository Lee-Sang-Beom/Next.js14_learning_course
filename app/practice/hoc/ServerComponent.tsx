import ClientComponent from "./ClientComponent";

interface IProps {
  userId: string;
  userPswd: string;
  userEmail: string;
  userTelno: string;
}

export default function ServerComponent() {
  const user: IProps = {
    userId: "user01",
    userPswd: "111111",
    userEmail: "userEmail@naver.com",
    userTelno: "010-1111-2222",
  };
  const user2: IProps = {
    userId: "user02",
    userPswd: "222222",
    userEmail: "userEmail2@naver.com",
    userTelno: "010-2222-3333",
  };
  const user3: IProps = {
    userId: "user03",
    userPswd: "333333",
    userEmail: "invaildEmailgamil.com",
    userTelno: "010-3333-4444",
  };
  return <ClientComponent userList={[user, user2, user3]} />;
}
