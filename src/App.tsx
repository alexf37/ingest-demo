import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IngestForm } from "./IngestForm";
import "./index.css";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <div className="container mx-auto">
          <IngestForm />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
