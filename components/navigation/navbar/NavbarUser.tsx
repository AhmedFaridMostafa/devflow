import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";

const NavbarUser = async () => {
  const session = await auth();
  return (
    session?.user?.id && (
      <UserAvatar
        id={session.user.id}
        name={session.user.name!}
        imageUrl={session.user?.image}
      />
    )
  );
};

export default NavbarUser;
