import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from '../../src/auth/constants/auth-metadata.constants';

export type AuthorizationCoverageRow = {
  controller: string;
  handler: string;
  controllerPath: string;
  handlerPath: string;
  methodCode: number | undefined;
  isPublic: boolean;
  roles: string[];
  covered: boolean;
};

type ControllerWrapper = {
  instance?: object;
  metatype?: Function;
};

type ModulesContainerLike = Map<
  unknown,
  {
    controllers: Map<unknown, ControllerWrapper>;
  }
>;

export function scanAuthorizationCoverage(
  app: INestApplication,
): AuthorizationCoverageRow[] {
  const reflector = app.get(Reflector);
  const container = (
    app as unknown as {
      container: {
        getModules(): ModulesContainerLike;
      };
    }
  ).container;

  const rows: AuthorizationCoverageRow[] = [];

  for (const moduleRef of container.getModules().values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance;
      const metatype = wrapper.metatype;

      if (!instance || !metatype) {
        continue;
      }

      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;

      const controllerPath = Reflect.getMetadata(PATH_METADATA, metatype) ?? '';

      const handlerNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== 'constructor' && typeof prototype[name] === 'function',
      );

      for (const handlerName of handlerNames) {
        const handler = prototype[handlerName] as Function;

        const handlerPath = Reflect.getMetadata(PATH_METADATA, handler) ?? '';

        const methodCode = Reflect.getMetadata(METHOD_METADATA, handler) as
          | number
          | undefined;

        if (methodCode === undefined) {
          continue;
        }

        const isPublic =
          reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            handler,
            metatype,
          ]) ?? false;

        const roles =
          reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            handler,
            metatype,
          ]) ?? [];

        rows.push({
          controller: metatype.name,
          handler: handlerName,
          controllerPath: String(controllerPath),
          handlerPath: String(handlerPath),
          methodCode,
          isPublic,
          roles,
          covered: isPublic || roles.length > 0,
        });
      }
    }
  }

  return rows.sort((left, right) =>
    `${left.controller}.${left.handler}`.localeCompare(
      `${right.controller}.${right.handler}`,
    ),
  );
}
