import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Index = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};
