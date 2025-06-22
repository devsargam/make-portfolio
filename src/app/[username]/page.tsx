type UserPageParams = Promise<{
  username: string;
}>;

export default async function UserPage({ params }: { params: UserPageParams }) {
  const { username } = await params;

  return <div className="text-white">{username}</div>;
}
