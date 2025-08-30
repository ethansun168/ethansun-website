import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function About() {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      <section className="flex flex-col items-center text-center py-24 px-4 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Generic about us description about what we are building and passionate about.
        </p>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
          Long-winded, generic description about our story, what we do, and what we stand for.
        </p>
        <div className="flex justify-center">
          <Button className="bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-700">
            Learn More
          </Button>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition duration-300">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-semibold mb-2">Developer 1</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Developer Role</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Some description of developer 1
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition duration-300">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-semibold mb-2">Developer 2</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Developer Role</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Some description of developer 2
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition duration-300">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-semibold mb-2">Developer 3</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Developer Role</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Some description of developer 3
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Call to Action</h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Tell people to join us.
        </p>
        <Button className="bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-700"
          onClick={() => navigate('/contact')}
        >
          Contact
        </Button>
      </section>
    </div>
  );
}

