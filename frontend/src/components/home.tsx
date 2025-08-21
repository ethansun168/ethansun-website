import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 text-white py-32 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Faz Corp</h1>
        <p className="text-xl mb-8">A modern platform to help you launch your ideas effortlessly.</p>
        <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700">
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg transition-colors duration-300">
            <CardHeader>
              <CardTitle>Fast & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our platform ensures your projects run smoothly with blazing speed and high reliability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg transition-colors duration-300">
            <CardHeader>
              <CardTitle>Collaborate Effortlessly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Invite your team, share tasks, and work together seamlessly from anywhere.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg transition-colors duration-300">
            <CardHeader>
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is safe with end-to-end encryption and strict privacy controls.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-indigo-600 dark:bg-indigo-700 text-white py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
        <p className="mb-8 text-lg">Join thousands of creators building the future today.</p>
        <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700">
          Sign Up Now
        </Button>
      </section>

      <footer className="py-12 text-center text-gray-500 dark:text-gray-400">
        © 2025 FazCorp. All rights reserved.
      </footer>
    </div>
  );
}

