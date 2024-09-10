import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1725991438185 implements MigrationInterface {
    name = 'Migrations1725991438185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "price" integer NOT NULL, "imagePath" character varying, "ownerId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer_deal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "customerId" uuid, "dealId" uuid, CONSTRAINT "PK_610b6622714eb0642f6bfc72b02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "username" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', "approved" boolean NOT NULL DEFAULT false, "partnerId" uuid, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" "public"."deal_status_enum" NOT NULL DEFAULT 'pending', "deal_price" integer NOT NULL, "partnerId" uuid, CONSTRAINT "PK_9ce1c24acace60f6d7dc7a7189e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_deal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "productId" uuid, "dealId" uuid, CONSTRAINT "PK_b1124efac04581a819523e0bf85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_cbb5d890de1519efa20c42bcd52" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_deal" ADD CONSTRAINT "FK_2341183c4a26a981f76140c375a" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_deal" ADD CONSTRAINT "FK_12d434a0a76e474ace1e181e685" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_92a00fa561c16ba10b29aa99be0" FOREIGN KEY ("partnerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_e88076b6f0ac469385d4cbfb28e" FOREIGN KEY ("partnerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_deal" ADD CONSTRAINT "FK_46167798b4e93900ec57e279df2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_deal" ADD CONSTRAINT "FK_6aa82a2a67614b20ae03a3ff37b" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_deal" DROP CONSTRAINT "FK_6aa82a2a67614b20ae03a3ff37b"`);
        await queryRunner.query(`ALTER TABLE "product_deal" DROP CONSTRAINT "FK_46167798b4e93900ec57e279df2"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_e88076b6f0ac469385d4cbfb28e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_92a00fa561c16ba10b29aa99be0"`);
        await queryRunner.query(`ALTER TABLE "customer_deal" DROP CONSTRAINT "FK_12d434a0a76e474ace1e181e685"`);
        await queryRunner.query(`ALTER TABLE "customer_deal" DROP CONSTRAINT "FK_2341183c4a26a981f76140c375a"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_cbb5d890de1519efa20c42bcd52"`);
        await queryRunner.query(`DROP TABLE "product_deal"`);
        await queryRunner.query(`DROP TABLE "deal"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "customer_deal"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
