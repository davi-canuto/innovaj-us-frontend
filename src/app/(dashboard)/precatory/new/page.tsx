import PrecatoryForm from "@/components/forms/precatory";
import {
  Plus,
} from "lucide-react"

export default function NewPrecatoryPage() {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <section className="mx-auto lg:max-w-[90%]">
        <div className="text-3xl font-semibold flex items-center space-x-2 mb-6">
          <Plus strokeWidth={3} className="text-[#248A61]" />
          <h1 className="text-[#1a384c]">Novo Precatório</h1>
        </div>
        <hr />
        <div className="mt-8">
          <PrecatoryForm redirectOnSuccess />
        </div>
      </section>
    </div>
  );
}
