import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <section className="flex flex-col items-center justify-center text-center py-32 px-4 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Awesome Landing Page
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Generic description about this amazing landing page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="default"
            className="bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="border-white text-black hover:bg-white hover:text-purple-700 dark:border-gray-400 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-purple-400"
          >
            Learn More
          </Button>
        </div>
      </section>

      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transform transition">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Responsive Design</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Looks amazing on all devices, from mobile to desktop.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transform transition">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Dark Mode</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fully supported dark mode for a sleek modern look.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transform transition">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-2">UI Components</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ready-to-use components from shadcn/ui make building interfaces fast.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-purple-600 dark:bg-purple-800 py-20 px-4 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Call To Action
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Inspirational description that calls out to the viewer.
        </p>
        <Button className="bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700">
          Get Started
        </Button>
      </section>
    </div>
  );
}

