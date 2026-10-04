import type { CitizenRecord } from "../../../packages/types/src/index";
import { db } from "./store";

/**
 * SHARED repository. Officer routes (Person 3) and citizen routes
 * read/write the same citizen records. Person 4's Prisma swap
 * replaces the internals of these functions only.
 */
export const citizenRepository = {
  findByPhone(phone: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.phone === phone);
  },
  findById(id: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.id === id);
  },
  findByConsumerNumber(consumerNumber: string): CitizenRecord | undefined {
    return db.citizens.find((c) => c.consumerNumber === consumerNumber);
  },
  search(query?: string): CitizenRecord[] {
    if (!query) return [...db.citizens];
    const q = query.toLowerCase();
    return db.citizens.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.consumerNumber.toLowerCase().includes(q),
    );
  },
  create(input: {
    name: string;
    phone: string;
    ward?: string;
    address?: string;
  }): CitizenRecord {
    const n = db.citizens.length + 78193;
    const record: CitizenRecord = {
      id: `CIT-${n}`,
      consumerNumber: `KMC-CON-${90215 + db.citizens.length}`,
      name: input.name,
      phone: input.phone,
      email: "",
      ward: input.ward || "Ward 12 - Rankala",
      address: input.address || "",
      connectionType: "Domestic",
      meterNumber: `MTR-${7700 + db.citizens.length}`,
      status: "Pending Verification",
      currentBalance: 0,
    };
    db.citizens.push(record);
    return record;
  },
  update(
    id: string,
    patch: Partial<Pick<CitizenRecord, "name" | "email" | "ward" | "address">>,
  ): CitizenRecord | undefined {
    const record = db.citizens.find((c) => c.id === id);
    if (!record) return undefined;
    if (patch.name !== undefined) record.name = patch.name;
    if (patch.email !== undefined) record.email = patch.email;
    if (patch.ward !== undefined) record.ward = patch.ward;
    if (patch.address !== undefined) record.address = patch.address;
    return record;
  },
};
