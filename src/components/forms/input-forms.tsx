"use client";

import { Field, ErrorMessage, FieldProps } from "formik";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function InputForm({ name, label, type = "text", placeholder = "", autoComplete }: FormInputProps) {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-bold text-[1rem]">
        {label}
      </label>

      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <>
            <Input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={cn(
                "mt-1 w-full text-[1rem]",
                meta.touched && meta.error ? "border-red-500 focus:border-red-500" : ""
              )}
            />
            <ErrorMessage
              name={name}
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </>
        )}
      </Field>
    </div>
  );
}
