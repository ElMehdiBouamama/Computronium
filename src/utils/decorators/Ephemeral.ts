import { notDeferedConfig } from "@config"

/**
 * Register a command as Ephemeral so that the reply isn't differed
 */
export const Ephemeral = () => {
    return (
        target: Record<string, any>,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        const commandName = `${target.constructor.name.replace('Command', '').toLowerCase()} ${propertyKey}`
        notDeferedConfig.commands.push(commandName)
    }
}