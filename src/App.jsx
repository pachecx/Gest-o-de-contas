import Header from "./components/Header";
import Dashboard from "./pages/DashBoard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Dashboard/>
    </div>
  );
}