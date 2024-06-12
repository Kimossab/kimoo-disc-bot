import prisma from "@/database";

export const getRoleCategory = async (server: string, category: string) => await prisma.roleCategory.findFirst({
  where: {
    serverId: server,
    category
  },
  include: {
    roles: true
  }
});

export const getRoleCategoriesByServer = async (server: string) => await prisma.roleCategory.findMany({
  where: { serverId: server },
  include: { roles: true }
});

export const addRoleCategory = async (
  server: string,
  category: string,
  message: string
): Promise<void> => {
  if (!await getRoleCategory(server, category)) {
    await prisma.roleCategory.create({
      data: {
        serverId: server,
        category,
        message
      }
    });
  }
};

export const addRole = async (
  server: string,
  category: string,
  role: string,
  icon: string | null
): Promise<void> => {
  const roleCategory = await getRoleCategory(server, category);
  if (!roleCategory) {
    throw Error("Role category not found.");
  }
  await prisma.role.create({
    data: {
      roleCategoryId: roleCategory.id,
      id: role,
      icon
    }
  });
};
