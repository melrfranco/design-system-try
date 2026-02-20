import "./global.css";

import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
<HashRouter>
  <Routes>
      <Route path="/" element={<Index />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
</HashRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
