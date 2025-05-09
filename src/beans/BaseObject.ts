import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

/**
 * The `BaseObject` class serves as a base model for objects with common properties
 * such as `id`, `description`, `createdAt`, and `updatedAt`. It includes validation
 * and transformation decorators for serialization and deserialization.
 *
 * Properties:
 * - `id` (string | undefined): A unique identifier for the object.
 * - `description` (string | undefined): A brief description of the object.
 * - `createdAt` (number | undefined): The timestamp when the object was created.
 * - `updatedAt` (number | undefined): The timestamp when the object was last updated.
 *
 * Methods:
 * - `getId()`: Returns the `id` of the object.
 * - `setId(value: string | undefined)`: Sets the `id` of the object.
 * - `getDescription()`: Returns the `description` of the object.
 * - `setDescription(value: string | undefined)`: Sets the `description` of the object.
 * - `getCreatedAt()`: Returns the `createdAt` timestamp of the object.
 * - `setCreatedAt(value?: number)`: Sets the `createdAt` timestamp of the object.
 * - `getUpdatedAt()`: Returns the `updatedAt` timestamp of the object.
 * - `setUpdatedAt(value?: number)`: Sets the `updatedAt` timestamp of the object.
 */
export class BaseObject {

    @Expose({ name: 'id' })
    @IsString()
    private id?: string;

    @Expose({ name: 'description' })
    @IsString()
    private description?: string;

    @Expose({ name: 'created_at' })
    @IsNumber()
    private createdAt?: number;

    @Expose({ name: 'updated_at' })
    @IsNumber()
    private updatedAt?: number;

    getId() {
        return this.id;
    }

    setId(value: string | undefined) {
        this.id = value;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    setCreatedAt(value?: number) {
        this.createdAt = value;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setUpdatedAt(value?: number) {
        this.updatedAt = value;
    }

    getDescription() {
        return this.description;
    }

    setDescription(value?: string) {
        this.description = value;
    }
}