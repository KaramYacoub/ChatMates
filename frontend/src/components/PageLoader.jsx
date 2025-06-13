import { Loader2 } from "lucide-react";
import { useThemeStore } from "../store/UseThemeStore";

function PageLoader() {
  const { theme } = useThemeStore();
  return (
    <div
      className="flex justify-center items-center min-h-screen"
      data-theme={theme}
    >
      <Loader2 className="animate-spin size-10 text-primary" />
    </div>
  );
}

export default PageLoader;
