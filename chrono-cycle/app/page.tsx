import SigninForm from "./components/login/signin"
import SignupForm from "./components/login/signup"

export default function Home() {
  return (
    <main className="m-0 w-screen h-screen">
      {/* section to hold login / signup */}
      <section className="w-full h-full flex justify-center items-center">
        {/* login / signup wrapper */}
        <div className="border border-red-200 w-2/4 h-3/4 relative overflow-hidden">
          {/* sign in section */}
          <div>
            <SigninForm />
          </div>
          {/* sign up section */}
          <div>
            <SignupForm />
          </div>
        </div>
      </section>
    </main>
  )
}
