/* eslint-disable class-methods-use-this */
import { App } from 'vue';

class ArchetypeDataValidator {
  public artifactIdIsValid(artifactId: string | null | undefined): boolean {
    return artifactId !== undefined && artifactId !== null && artifactId !== '';
  }

  public groupIdIsValid(groupId: string | null | undefined): boolean {
    return groupId !== undefined && groupId !== null && groupId !== '';
  }

  public packageManagerProjectNameIsValid(name: string | null | undefined): boolean {
    return name !== undefined && name !== null && name !== '';
  }

  public packageNameIsValid(packageName: string | null | undefined): boolean {
    return packageName !== undefined && packageName !== null && packageName !== '';
  }

  public projectVersionIsValid(version: string | null | undefined): boolean {
    return version !== undefined && version !== null && version !== '';
  }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $archetypeValidationService: ArchetypeDataValidator;
    }
}

export const archetypeDataValidator = new ArchetypeDataValidator();

const ArchetypeDataValidationService = {
  install: (app: App): void => {
    const { globalProperties } = app.config;
    globalProperties.$archetypeValidationService = archetypeDataValidator;
  },
};

export default ArchetypeDataValidationService;
