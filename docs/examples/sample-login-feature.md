# Sample Feature: Login

この文書は、Test Design Studio のP0モデルを使って1機能分の設計データをどう表現するかを示すサンプルである。

## Project

```text
name: Sample SaaS
targetAppName: Sample SaaS Web
targetAppUrl: https://example.test
```

## Feature

```text
name: Login
purpose: 登録済みユーザーがアプリケーションにアクセスできるようにする
actor: Registered user
preconditions: ユーザーが登録済みである
successCriteria: 正しい認証情報でログインするとダッシュボードへ遷移する
failureConditions: 認証情報が不正な場合はエラーを表示し、ログインしない
priority: high
riskLevel: high
confidence: confirmed
```

## Screen

```text
name: Login page
screenType: login
urlPattern: /login
purpose: ユーザーがメールアドレスとパスワードを入力してログインする
preconditions: 未ログイン状態である
confidence: confirmed
```

## UiNodes

| name           | role    | componentType  | textHint                  | selectorHint                            | required |
| -------------- | ------- | -------------- | ------------------------- | --------------------------------------- | -------- |
| Email input    | textbox | text-input     | Email                     | getByRole('textbox', { name: 'Email' }) | true     |
| Password input | textbox | password-input | Password                  | getByLabel('Password')                  | true     |
| Login button   | button  | button         | Login                     | getByRole('button', { name: 'Login' })  | true     |
| Error message  | alert   | message        | Invalid email or password | getByRole('alert')                      | false    |

## DataTypes

### Email

```text
baseType: string
constraints.required: true
constraints.pattern: email-like string
validExamples: user@example.test
invalidExamples: empty, invalid-email
```

### Password

```text
baseType: string
constraints.required: true
constraints.minLength: 8
validExamples: valid password string
invalidExamples: empty, shorter than 8 characters
```

## BusinessRules

### Valid credentials allow login

```text
ruleType: workflow
confidence: confirmed
description: Registered users can log in with a valid email and password.
```

### Invalid credentials show error

```text
ruleType: error
confidence: confirmed
description: Invalid email or password must show an error and keep the user on the login page.
```

## OpenQuestions

### Account lock policy

```text
question: Are accounts locked after repeated failed login attempts?
context: The current login page shows a generic error, but the lockout policy is not documented.
questionStatus: open
confidence: unknown
```

## TestViewpoints

### Invalid credential validation

```text
technique: equivalence
priority: high
automationSuitability: high
automationReason: Deterministic input and visible error message.
```

Trace links:

```text
TestViewpoint derived_from BusinessRule: Invalid credentials show error
TestViewpoint derived_from UiNode: Email input
TestViewpoint derived_from UiNode: Password input
TestViewpoint derived_from UiNode: Login button
TestViewpoint derived_from UiNode: Error message
```

## TestCase

### Invalid password cannot log in

```text
preconditions: User exists and is logged out.
priority: high
automationSuitability: high
automationReason: Can be checked with stable form inputs and alert message.
```

Steps:

| order | action   | targetUiNode   | instruction                       | expectedResult                        | testData          |
| ----: | -------- | -------------- | --------------------------------- | ------------------------------------- | ----------------- |
|     1 | navigate |                | Open the login page.              | Login form is displayed.              | /login            |
|     2 | fill     | Email input    | Enter a registered email address. | Email input contains the value.       | user@example.test |
|     3 | fill     | Password input | Enter an invalid password.        | Password input accepts the value.     | wrong-password    |
|     4 | click    | Login button   | Click the login button.           | Error message is displayed.           |                   |
|     5 | assert   | Error message  | Confirm the error message.        | Invalid email or password is visible. |                   |

Trace links:

```text
TestCase covers TestViewpoint: Invalid credential validation
TestCase validates BusinessRule: Invalid credentials show error
TestCase depends_on UiNode: Email input
TestCase depends_on UiNode: Password input
TestCase depends_on UiNode: Login button
TestCase depends_on UiNode: Error message
```

## Notes

このサンプルでは、OpenQuestionを未解決のまま残している。未確認事項に基づく観点やケースを作る場合は、TraceLinkで `derived_from openQuestion` を作り、Markdown exportで未確認であることが分かるようにする。
