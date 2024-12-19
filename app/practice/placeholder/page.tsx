// Page.tsx (서버 컴포넌트)
import ImageComponent from "./ImageComponent";

export default function Page() {
  return (
    <div>
      <h1>Welcome to Our Page</h1>
      <p>This is a page with an image that loads progressively.</p>
      <ImageComponent
        src="/hero-mobile.png"
        alt="Content Mobile Preview Image"
      />
    </div>
  );
}
