import { PrismaClient, Prisma } from '@prisma/client';

// Lista de modelos que soportan borrado lógico en tu schema
const SOFT_DELETE_MODELS = [
  'Usuario',
  'Empresa',
  'Cliente',
  'Categoria',
  'Producto'
] as const;

export const softDeleteExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    name: 'SoftDeleteExtension',
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            args.where = { ...args.where, eliminadoEn: null };
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            args.where = { ...args.where, eliminadoEn: null };
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            // Un findUnique falla si le inyectamos campos no únicos, lo transformamos a findFirst
            const { where, ...rest } = args;
            return (prisma as any)[model].findFirst({
              where: { ...where, eliminadoEn: null },
              ...rest,
            });
          }
          return query(args);
        },
        async delete({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            // Transformamos el borrado físico en actualización
            return (prisma as any)[model].update({
              ...args,
              data: { eliminadoEn: new Date() },
            });
          }
          return query(args);
        },
        async deleteMany({ model, operation, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            return (prisma as any)[model].updateMany({
              ...args,
              data: { eliminadoEn: new Date() },
            });
          }
          return query(args);
        },
      },
    },
  });
};