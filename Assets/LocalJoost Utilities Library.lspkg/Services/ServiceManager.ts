/**
 * A service manager that allows registration and retrieval of services by their interface types
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<any, any> = new Map();

  /**
   * Gets the singleton instance of the ServiceManager
   */
  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

 private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Register an implementation for an interface
   * @param interfaceType The interface constructor function
   * @param implementation The implementation instance
   */
  public register<I,C>(interfaceType: I, implementationType: C, ): void {
    let serviceName = 'Unknown implementation';
    if (typeof interfaceType === 'function') {
      serviceName = interfaceType.name || 'Anonymous implementation';
    }
    if (this.services.has(interfaceType)) {
      print(`Service for ${serviceName} is being overwritten`);
    }
    print(`Registering service for ${serviceName}`);
    this.services.set(interfaceType, implementationType);
  }

  /**
   * Get an implementation for an interface
   * @param interfaceType The interface constructor function
   * @returns The implementation instance or null if not found
   */
  public get<T>(interfaceType: Function): T | null {
    return this.services.get(interfaceType) as T || null;
  }

  /**
   * Remove an implementation for an interface
   * @param interfaceType The interface constructor function
   * @returns True if the implementation was removed, false otherwise
   */
  public remove(interfaceType: Function): boolean {
    return this.services.delete(interfaceType);
  }

  /**
   * Clears all registered services
   */
  public clear(): void {
    this.services.clear();
  }
}