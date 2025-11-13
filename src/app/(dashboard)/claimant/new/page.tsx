import FormPetitioner from "@/components/forms/form-petitioner";
import {
  Plus,
} from "lucide-react"
export default function Home() {
  return (
    <div className="border rounded-2xl p-6 ">
      <section className="mx-auto lg:max-w-[90%]">
        <div className="text-3xl font-semibold flex items-center space-x-2 mb-6"  >
          <Plus strokeWidth={3} className=" text-[#248A61]" />
          <h1 className=" text-[#1a384c]"> Novo Credor</h1>
        </div>
        <hr />
        <FormPetitioner/>

      </section>

    </div>
  );
}
