"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";

import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/user.action";
import { type ProfileFormData, ProfileSchema } from "@/lib/validations";

import { Textarea } from "../ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import CountryField from "../CountryField";

interface ProfileFormProps {
  user: User;
  countries: Country[];
}

const ProfileForm = ({ user, countries }: ProfileFormProps) => {
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      userId: user._id,
      name: user.name,
      username: user.username,
      portfolio: user.portfolio ?? undefined,
      location: user.location ?? undefined,
      bio: user.bio ?? undefined,
    },
  });

  const isPending = form.formState.isSubmitting;

  const handleUpdateProfile = async (values: ProfileFormData) => {
    const result = await updateProfile(values);
    if (result.success) {
      toast.success("Your profile has been updated successfully.");
      router.push(ROUTES.PROFILE(user._id));
    } else {
      toast.error(`Error (${result.status})`, {
        description: result.error?.message,
      });
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleUpdateProfile)}
      className="mt-9 flex w-full flex-col gap-9"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-3.5">
              <FieldLabel
                htmlFor={field.name}
                className="paragraph-semibold text-dark400_light800"
              >
                Name <span className="text-primary-500">*</span>
              </FieldLabel>

              <Input
                id={field.name}
                className="no-focus paragraph-regular light-border-2 background-light800_dark300 text-dark300_light700 min-h-14 border"
                placeholder="Your Name"
                aria-invalid={fieldState.invalid}
                {...field}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-3.5">
              <FieldLabel
                htmlFor={field.name}
                className="paragraph-semibold text-dark400_light800"
              >
                Username <span className="text-primary-500">*</span>
              </FieldLabel>

              <Input
                id={field.name}
                className="no-focus paragraph-regular light-border-2 background-light800_dark300 text-dark300_light700 min-h-14 border"
                placeholder="Your username"
                aria-invalid={fieldState.invalid}
                {...field}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="portfolio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-3.5">
              <FieldLabel
                htmlFor={field.name}
                className="paragraph-semibold text-dark400_light800"
              >
                Portfolio Link
              </FieldLabel>

              <Input
                id={field.name}
                type="url"
                className="no-focus paragraph-regular light-border-2 background-light800_dark300 text-dark300_light700 min-h-14 border"
                placeholder="Your Portfolio link"
                aria-invalid={fieldState.invalid}
                {...field}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-3.5">
              <FieldLabel
                htmlFor={field.name}
                className="paragraph-semibold text-dark400_light800"
              >
                Location
              </FieldLabel>

              <CountryField
                value={field.value}
                onChange={field.onChange}
                countries={countries}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-3.5">
              <FieldLabel
                htmlFor={field.name}
                className="paragraph-semibold text-dark400_light800"
              >
                Bio
              </FieldLabel>

              <Textarea
                id={field.name}
                rows={5}
                className="no-focus paragraph-regular light-border-2 background-light800_dark300 text-dark300_light700 min-h-14 border"
                placeholder="What's special about you?"
                aria-invalid={fieldState.invalid}
                {...field}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal" className="justify-end">
          <Button
            type="submit"
            className="primary-gradient w-fit cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ProfileForm;
