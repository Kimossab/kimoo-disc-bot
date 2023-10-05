import RoleCategory, { IRoleCategory } from "./models/RoleCategory.model";

export const getRoleCategory = async (
  server: string,
  category: string
): Promise<IRoleCategory | null> =>
  RoleCategory.findOne({
    server,
    category,
  });

export const getRoleCategoriesByServer = async (
  server: string
): Promise<IRoleCategory[]> => RoleCategory.find({ server });

export const addRoleCategory = async (
  server: string,
  category: string,
  message: string
): Promise<void> => {
  if (!(await getRoleCategory(server, category))) {
    const cat = new RoleCategory();
    cat.server = server;
    cat.category = category;
    cat.message = message;
    cat.roles = [];
    await cat.save();
  }
};

export const addRole = async (
  server: string,
  category: string,
  role: string,
  icon: string | null
): Promise<void> => {
  await RoleCategory.updateOne(
    { server, category },
    { $push: { roles: { role, icon } } }
  );
};
