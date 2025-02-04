import SigninForm from "./components/signin"

export default function Home() {
  return (
    <main className="m-0 w-screen h-screen">
      {/* section to hold login / signup */}
      <section className="w-full h-full flex justify-center items-center">
        {/* login / signup wrapper */}
        <div className="border border-red-200 w-2/4 h-3/4 flex">
          {/* left side*/}
          <div className="w-1/2 h-auto">
            <h1>This is the left side</h1>
          </div>
          {/* right side */}
          <div className="w-1/2 h-auto">
            <SigninForm />
          </div>
        </div>
      </section>
    </main>
  )
}
