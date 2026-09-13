import axios from "axios";
const GROUP_ID = "701477590";

export async function GetUserRank(username: string) {
  try {
    const user = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false,
      },
    );

    if (!user.data.data.length) return null;

    const robloxUser = user.data.data[0];
    const userId = robloxUser.id;

    let avatarUrl = "";
    try {
      const avatarResponse = await axios.get(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
      );
      if (avatarResponse.data?.data?.length) {
        avatarUrl = avatarResponse.data.data[0].imageUrl;
      }
    } catch (avatarError) {
      console.error("Avatar fetching fatal error", avatarError);
    }

    const groups = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
    );

    const group = groups.data.data.find(
      (g: any) => g.group.id === Number(GROUP_ID),
    );

    if (!group) {
      return {
        inGroup: false,
        userId,
        username: robloxUser.name,
        displayName: robloxUser.displayName,
        rankId: group.role.rank,
        rankName: group.role.name,
        avatar: avatarUrl,
      };
    }

    return {
      inGroup: true,
      userId,
      username: robloxUser.name,
      displayName: robloxUser.displayName,
      rankId: group.role.rank,
      rankName: group.role.name,
      avatar: avatarUrl,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
