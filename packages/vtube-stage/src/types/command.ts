import { Type } from 'class-transformer';
import { IsString, IsNumber, Min, Max, ValidateNested, IsDefined } from 'class-validator';

// 基本的なコマンド構造 (クラスに変更)
export class BaseCommand<T extends string, P> {
  @IsString()
  @IsDefined()
  command!: T;

  @ValidateNested()
  @Type(() => Object) // ここは具象クラスでオーバーライドする必要がある
  @IsDefined()
  payload!: P;
}

// setExpression コマンドのペイロードクラス
export class SetExpressionPayload {
  @IsString()
  @IsDefined()
  characterId!: string;

  @IsString()
  @IsDefined()
  expressionName!: string; // TODO: 特定の表情名に限定する場合は @IsIn を使用

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsDefined()
  weight!: number;
}
export class SetExpressionCommand extends BaseCommand<'setExpression', SetExpressionPayload> {
  declare command: 'setExpression';

  @ValidateNested()
  @Type(() => SetExpressionPayload)
  @IsDefined()
  declare payload: SetExpressionPayload;
}

// logMessage コマンドのペイロードクラス
export class LogMessagePayload {
  @IsString()
  @IsDefined()
  message!: string;
}
export class LogMessageCommand extends BaseCommand<'logMessage', LogMessagePayload> {
  declare command: 'logMessage';

  @ValidateNested()
  @Type(() => LogMessagePayload)
  @IsDefined()
  declare payload: LogMessagePayload;
}

// setPose コマンドのペイロードクラス (将来用)
export class SetPosePayload {
  @IsString()
  @IsDefined()
  characterId!: string;

  @IsString()
  @IsDefined()
  poseName!: string; // TODO: 特定のポーズ名に限定する場合は @IsIn を使用
}
export class SetPoseCommand extends BaseCommand<'setPose', SetPosePayload> {
  declare command: 'setPose';

  @ValidateNested()
  @Type(() => SetPosePayload)
  @IsDefined()
  declare payload: SetPosePayload;
}

// triggerAnimation コマンドのペイロードクラス (将来用)
export class TriggerAnimationPayload {
  @IsString()
  @IsDefined()
  characterId!: string;

  @IsString()
  @IsDefined()
  animationName!: string; // TODO: 特定のアニメーション名に限定する場合は @IsIn を使用
}
export class TriggerAnimationCommand extends BaseCommand<'triggerAnimation', TriggerAnimationPayload> {
  declare command: 'triggerAnimation';

  @ValidateNested()
  @Type(() => TriggerAnimationPayload)
  @IsDefined()
  declare payload: TriggerAnimationPayload;
}

// 受け取る可能性のある全てのコマンドの Union 型 (クラスの Union に変更)
export type StageCommand = SetExpressionCommand | LogMessageCommand | SetPoseCommand | TriggerAnimationCommand;

// 型ガードは class-validator の validate 関数で代替するため不要になることが多い
// export function isStageCommand(obj: unknown): obj is StageCommand {
//   return typeof obj === 'object' && obj !== null && typeof obj.command === 'string' && typeof obj.payload === 'object';
// }

// --- バリデーション関数の例 ---
// import { validate, ValidationError } from 'class-validator';
// import { plainToInstance, ClassConstructor } from 'class-transformer';
//
// const commandRegistry: { [key: string]: ClassConstructor<StageCommand> } = {
//   setExpression: SetExpressionCommand,
//   logMessage: LogMessageCommand,
//   setPose: SetPoseCommand,
//   triggerAnimation: TriggerAnimationCommand,
// };
//
// export async function validateStageCommand(input: unknown): Promise<{ command: StageCommand | null; errors: ValidationError[] }> {
//   if (typeof input !== 'object' || input === null || !('command' in input) || typeof input.command !== 'string') {
//     // 基本的な形状チェック
//     return { command: null, errors: [{ property: 'command', constraints: { isString: 'command must be a string' } }] };
//   }
//
//   const commandType = input.command;
//   const CommandClass = commandRegistry[commandType];
//
//   if (!CommandClass) {
//     return { command: null, errors: [{ property: 'command', constraints: { isKnownCommand: `Unknown command type: ${commandType}` } }] };
//   }
//
//   // plainToInstance でプレーンオブジェクトをクラスインスタンスに変換
//   const instance = plainToInstance(CommandClass, input);
//
//   // validate でバリデーション実行
//   const errors = await validate(instance);
//
//   if (errors.length > 0) {
//     return { command: null, errors };
//   }
//
//   return { command: instance, errors: [] };
// }
