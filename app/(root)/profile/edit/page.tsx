import { redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileForm from "@/components/forms/ProfileForm";
import ROUTES from "@/constants/routes";
import { getUser } from "@/lib/actions/user.action";
import { connection } from "next/server";
import { fetchCountries } from "@/lib/actions/job.action";

const ProfileEditPage = async () => {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN);

  const getUserResult = await getUser({ userId: session.user.id });
  if (!getUserResult.success) redirect(ROUTES.SIGN_IN);
  const countries = await fetchCountries();
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <ProfileForm
        user={getUserResult.data.user}
        countries={countries.success ? countries.data : []}
      />
    </>
  );
};

export default ProfileEditPage;
