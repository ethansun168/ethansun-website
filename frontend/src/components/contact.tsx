import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Contact() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <section className="flex flex-col items-center text-center py-24 px-4 bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Generic description about how it would be great to hear from the viewer.
        </p>
      </section>

      <section className="py-20 px-4 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <form className="flex flex-col gap-6" onSubmit={(e) => {
            e.preventDefault();
            alert("Form not submitted");
          }}>
            <div>
              <label className="block mb-2 font-semibold" htmlFor="name">
                Name
              </label>
              <Input id="name" placeholder="Your Name" className="w-full" />
            </div>

            <div>
              <label className="block mb-2 font-semibold" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="you@example.com" className="w-full" />
            </div>

            <div>
              <label className="block mb-2 font-semibold" htmlFor="message">
                Message
              </label>
              <Textarea id="message" placeholder="Your message..." className="w-full" rows={5} />
            </div>

            <Button type="submit" className="bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-700">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <section className="py-12 px-4 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Other Ways to Reach Us</h2>
        List some other ways to reach us here.
      </section>
    </div>
  );
}

