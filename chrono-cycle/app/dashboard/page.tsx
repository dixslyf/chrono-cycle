// dashboard page
// import Navbar from "@/app/dashboard/nav";
import Navbar from "../components/nav/navbar";

export default function Dashboard() {
    return (
        <div>
            <Navbar />
            <main className="m-0 w-full h-full">
                <h1>This is the dashboard page</h1>
            </main>
        </div>
    );
}
