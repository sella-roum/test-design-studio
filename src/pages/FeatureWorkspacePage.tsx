import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { createFeatureRepository } from '../lib/repositories/featureRepository';
import { useScreens } from '../hooks/useScreens';
import { useUiNodes } from '../hooks/useUiNodes';
import { useDataTypes } from '../hooks/useDataTypes';
import { useBusinessRules } from '../hooks/useBusinessRules';
import { useToast } from '../components/common/ToastContext';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { FeatureEditDialog } from '../components/feature/FeatureEditDialog';
import { ScreenDetailPanel } from '../components/screen/ScreenDetailPanel';
import { UiNodeTree } from '../components/uiNode/UiNodeTree';
import { UiNodeCreateDialog } from '../components/uiNode/UiNodeCreateDialog';
import { UiNodeEditDialog } from '../components/uiNode/UiNodeEditDialog';
import { DataTypeCreateDialog } from '../components/dataType/DataTypeCreateDialog';
import { DataTypeEditDialog } from '../components/dataType/DataTypeEditDialog';
import { BusinessRuleCreateDialog } from '../components/businessRule/BusinessRuleCreateDialog';
import { BusinessRuleEditDialog } from '../components/businessRule/BusinessRuleEditDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { OpenQuestionCreateDialog } from '../components/openQuestion/OpenQuestionCreateDialog';
import { OpenQuestionEditDialog } from '../components/openQuestion/OpenQuestionEditDialog';
import { OpenQuestionTable } from '../components/openQuestion/OpenQuestionTable';
import { TestViewpointCreateDialog } from '../components/testViewpoint/TestViewpointCreateDialog';
import { TestViewpointEditDialog } from '../components/testViewpoint/TestViewpointEditDialog';
import { TestViewpointTable } from '../components/testViewpoint/TestViewpointTable';
import { TestCaseCreateDialog } from '../components/testCase/TestCaseCreateDialog';
import { TestCaseEditDialog } from '../components/testCase/TestCaseEditDialog';
import { TestCaseTable } from '../components/testCase/TestCaseTable';
import { useOpenQuestions } from '../hooks/useOpenQuestions';
import { useTestViewpoints } from '../hooks/useTestViewpoints';
import { useTestCases } from '../hooks/useTestCases';
import type { Feature } from '../lib/models/feature';
import type { UiNode, UiNodeTreeNode } from '../lib/models/uiNode';
import type { OpenQuestion } from '../lib/models/openQuestion';
import type { TestViewpoint } from '../lib/models/testViewpoint';
import type { TestCase } from '../lib/models/testCase';
import type { DataType } from '../lib/models/dataType';
import type { BusinessRule } from '../lib/models/businessRule';

const featureRepo = createFeatureRepository(db);

type TabId =
  | 'overview'
  | 'screens'
  | 'data-rules'
  | 'open-questions'
  | 'viewpoints'
  | 'test-cases'
  | 'traceability';

const TABS: { id: TabId; label: string; disabled?: boolean; placeholder?: boolean }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'screens', label: 'Screens / UI Tree' },
  { id: 'data-rules', label: 'Data / Rules' },
  { id: 'open-questions', label: 'Open Questions' },
  { id: 'viewpoints', label: 'Viewpoints' },
  { id: 'test-cases', label: 'Test Cases' },
  { id: 'traceability', label: 'Traceability', placeholder: true },
];

function flattenTree(node: UiNodeTreeNode): UiNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

export function FeatureWorkspacePage() {
  const { projectId, featureId } = useParams<{ projectId: string; featureId: string }>();
  const toast = useToast();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editing, setEditing] = useState(false);

  const { screens } = useScreens(projectId ?? '');
  const relatedScreens = screens.filter((s) => s.featureId === featureId);

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const selectedScreen = relatedScreens.find((s) => s.id === selectedScreenId) ?? null;
  const {
    tree: uiNodeTree,
    create: createUiNode,
    update: updateUiNode,
    markRemoved: removeUiNode,
  } = useUiNodes(selectedScreenId ?? undefined);

  const [selectedUiNodeId, setSelectedUiNodeId] = useState<string | null>(null);
  const [creatingUiNode, setCreatingUiNode] = useState<{ parentId?: string } | null>(null);
  const [editingUiNode, setEditingUiNode] = useState<UiNode | null>(null);
  const [removingUiNode, setRemovingUiNode] = useState<UiNode | null>(null);

  const allUiNodes = useMemo(() => uiNodeTree.flatMap((n) => flattenTree(n)), [uiNodeTree]);
  const uiNodeCount = useMemo(() => allUiNodes.length, [allUiNodes]);

  const {
    dataTypes,
    create: createDataType,
    update: updateDataType,
    markRemoved: removeDataType,
  } = useDataTypes(projectId ?? '');
  const {
    businessRules,
    create: createBusinessRule,
    update: updateBusinessRule,
    markRemoved: removeBusinessRule,
  } = useBusinessRules(projectId ?? '', featureId ?? '');

  const [showCreateDataType, setShowCreateDataType] = useState(false);
  const [editingDataType, setEditingDataType] = useState<DataType | null>(null);
  const [removingDataType, setRemovingDataType] = useState<DataType | null>(null);
  const [showCreateBusinessRule, setShowCreateBusinessRule] = useState(false);
  const [editingBusinessRule, setEditingBusinessRule] = useState<BusinessRule | null>(null);
  const [removingBusinessRule, setRemovingBusinessRule] = useState<BusinessRule | null>(null);

  const {
    openQuestions,
    create: createOpenQuestion,
    update: updateOpenQuestion,
    markRemoved: removeOpenQuestion,
  } = useOpenQuestions(projectId ?? '', featureId);
  const {
    viewpoints,
    create: createViewpoint,
    update: updateViewpoint,
    markRemoved: removeViewpoint,
  } = useTestViewpoints(projectId ?? '', featureId ?? '');
  const {
    testCases,
    create: createTestCase,
    update: updateTestCase,
    markRemoved: removeTestCase,
  } = useTestCases(projectId ?? '', featureId ?? '');

  const [showCreateOpenQuestion, setShowCreateOpenQuestion] = useState(false);
  const [editingOpenQuestion, setEditingOpenQuestion] = useState<OpenQuestion | null>(null);
  const [removingOpenQuestion, setRemovingOpenQuestion] = useState<OpenQuestion | null>(null);
  const [showCreateViewpoint, setShowCreateViewpoint] = useState(false);
  const [editingViewpoint, setEditingViewpoint] = useState<TestViewpoint | null>(null);
  const [removingViewpoint, setRemovingViewpoint] = useState<TestViewpoint | null>(null);
  const [showCreateTestCase, setShowCreateTestCase] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [removingTestCase, setRemovingTestCase] = useState<TestCase | null>(null);

  const testCaseCountsByViewpoint = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tc of testCases) {
      if (tc.viewpointId) {
        counts[tc.viewpointId] = (counts[tc.viewpointId] ?? 0) + 1;
      }
    }
    return counts;
  }, [testCases]);

  useEffect(() => {
    if (!featureId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeature(null);
    setNotFound(false);
    let cancelled = false;
    featureRepo
      .get(featureId)
      .then((f) => {
        if (cancelled) return;
        if (!f || f.status === 'removed' || f.projectId !== projectId) {
          setNotFound(true);
        } else {
          setFeature(f);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [featureId, projectId]);

  const handleUpdate = async (id: string, patch: Parameters<typeof featureRepo.update>[1]) => {
    const updated = await featureRepo.update(id, patch);
    setFeature(updated);
    setEditing(false);
    toast.toast('success', '機能を更新しました');
  };

  const handleCreateUiNode = async (input: {
    projectId: string;
    name: string;
    parentId?: string;
    role?: string;
    componentType?: string;
    description?: string;
    selectorHint?: string;
    textHint?: string;
  }) => {
    const node = await createUiNode(input);
    return node;
  };

  const handleUpdateUiNode = async (id: string, patch: Parameters<typeof updateUiNode>[1]) => {
    await updateUiNode(id, patch);
    setEditingUiNode(null);
  };

  const handleRemoveUiNode = async () => {
    if (!removingUiNode) return;
    try {
      await removeUiNode(removingUiNode.id);
      toast.toast('success', 'UI要素を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : 'UI要素の削除に失敗しました');
    } finally {
      setRemovingUiNode(null);
    }
  };

  const handleCreateOpenQuestion = async (input: {
    question: string;
    context?: string;
    questionStatus: import('../lib/models/openQuestion').OpenQuestionStatus;
    confidence: import('../lib/types').Confidence;
  }) => {
    return createOpenQuestion(input);
  };

  const handleUpdateOpenQuestion = async (
    id: string,
    patch: Parameters<typeof updateOpenQuestion>[1],
  ) => {
    const result = await updateOpenQuestion(id, patch);
    setEditingOpenQuestion(null);
    return result;
  };

  const handleRemoveOpenQuestion = async () => {
    if (!removingOpenQuestion) return;
    try {
      await removeOpenQuestion(removingOpenQuestion.id);
      toast.toast('success', '未確定事項を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : '未確定事項の削除に失敗しました');
    } finally {
      setRemovingOpenQuestion(null);
    }
  };

  const handleCreateViewpoint = async (input: {
    title: string;
    description?: string;
    technique?: import('../lib/models/testViewpoint').TestTechnique;
    priority?: import('../lib/types').Priority;
    automationSuitability?: import('../lib/types').AutomationSuitability;
    automationReason?: string;
  }) => {
    return createViewpoint(input);
  };

  const handleUpdateViewpoint = async (
    id: string,
    patch: Parameters<typeof updateViewpoint>[1],
  ) => {
    const result = await updateViewpoint(id, patch);
    setEditingViewpoint(null);
    return result;
  };

  const handleRemoveViewpoint = async () => {
    if (!removingViewpoint) return;
    try {
      await removeViewpoint(removingViewpoint.id);
      toast.toast('success', 'テスト観点を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : 'テスト観点の削除に失敗しました');
    } finally {
      setRemovingViewpoint(null);
    }
  };

  const handleCreateTestCase = async (input: {
    title: string;
    viewpointId?: string;
    preconditions?: string;
    steps?: {
      id: string;
      action: import('../lib/models/testCase').TestStepAction;
      instruction: string;
      targetUiNodeId?: string;
      expectedResult?: string;
      testData?: string;
    }[];
    priority?: import('../lib/types').Priority;
    automationSuitability?: import('../lib/types').AutomationSuitability;
    automationReason?: string;
  }) => {
    return createTestCase(input);
  };

  const handleUpdateTestCase = async (id: string, patch: Parameters<typeof updateTestCase>[1]) => {
    const result = await updateTestCase(id, patch);
    setEditingTestCase(null);
    return result;
  };

  const handleRemoveTestCase = async () => {
    if (!removingTestCase) return;
    try {
      await removeTestCase(removingTestCase.id);
      toast.toast('success', 'テストケースを削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : 'テストケースの削除に失敗しました');
    } finally {
      setRemovingTestCase(null);
    }
  };

  const handleEditDataType = useCallback(
    async (id: string, patch: Parameters<typeof updateDataType>[1]) => {
      const result = await updateDataType(id, patch);
      setEditingDataType(null);
      return result;
    },
    [updateDataType, setEditingDataType],
  );

  const handleRemoveDataType = async () => {
    if (!removingDataType) return;
    try {
      await removeDataType(removingDataType.id);
      toast.toast('success', 'データ型を削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : 'データ型の削除に失敗しました');
    } finally {
      setRemovingDataType(null);
    }
  };

  const handleEditBusinessRule = useCallback(
    async (id: string, patch: Parameters<typeof updateBusinessRule>[1]) => {
      const result = await updateBusinessRule(id, patch);
      setEditingBusinessRule(null);
      return result;
    },
    [updateBusinessRule, setEditingBusinessRule],
  );

  const handleRemoveBusinessRule = async () => {
    if (!removingBusinessRule) return;
    try {
      await removeBusinessRule(removingBusinessRule.id);
      toast.toast('success', '業務ルールを削除しました');
    } catch (e) {
      toast.toast('error', e instanceof Error ? e.message : '業務ルールの削除に失敗しました');
    } finally {
      setRemovingBusinessRule(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Feature Workspace</h1>
        </div>
        <div className="kpi-cards">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="card" key={i}>
              <div className="skeleton" style={{ height: 28, marginBottom: 8, width: '40%' }} />
              <div className="skeleton" style={{ height: 14, width: '60%' }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 40 }} />
        <div className="skeleton" style={{ height: 200, marginTop: 12 }} />
      </div>
    );
  }

  if (notFound || !feature) {
    return (
      <div className="error-page">
        <h1>機能が見つかりません</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          指定された機能は存在しないか、削除されました。
        </p>
        <Link to={`/projects/${projectId}`} className="btn btn-primary">
          プロジェクトダッシュボードへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
          <Link
            to={`/projects/${projectId}`}
            style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
          >
            プロジェクト
          </Link>
          {' > '}
          {feature.name}
        </p>
      </div>

      <div className="page-header" style={{ marginBottom: 8 }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {feature.name}
            </h1>
            <Badge variant={feature.status} />
          </div>
          {feature.description && (
            <p className="page-description" style={{ marginTop: 4 }}>
              {feature.description}
            </p>
          )}
        </div>
        <div className="page-header-actions">
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-muted)' }}>
            更新: {new Date(feature.updatedAt).toLocaleString('ja-JP')}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            編集
          </button>
        </div>
      </div>

      <div className="kpi-cards" style={{ marginBottom: 24 }}>
        <div className="card kpi-card">
          <p className="kpi-number">{relatedScreens.length}</p>
          <p className="kpi-label">画面</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">{uiNodeCount}</p>
          <p className="kpi-label">UI要素</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">{openQuestions.length}</p>
          <p className="kpi-label">未確認事項</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">{viewpoints.length}</p>
          <p className="kpi-label">テスト観点</p>
        </div>
        <div className="card kpi-card">
          <p className="kpi-number">{testCases.length}</p>
          <p className="kpi-label">テストケース</p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 2,
          borderBottom: '2px solid var(--color-border)',
          marginBottom: 24,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '8px 16px',
              borderRadius: 0,
              borderBottom:
                activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -2,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: tab.placeholder ? 'default' : 'pointer',
              opacity: tab.placeholder ? 0.5 : 1,
            }}
            onClick={() => !tab.placeholder && setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2col">
          <div className="card">
            <h3
              style={{ fontSize: 'var(--fs-section-title)', margin: '0 0 16px', fontWeight: 600 }}
            >
              機能概要
            </h3>
            <table className="table" style={{ fontSize: 'var(--fs-body)' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, width: 140 }}>説明</td>
                  <td>{feature.description || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>目的</td>
                  <td>{feature.purpose || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>主利用者</td>
                  <td>{feature.actor || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>前提条件</td>
                  <td>{feature.preconditions || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>成功条件</td>
                  <td>{feature.successCriteria || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>失敗条件</td>
                  <td>{feature.failureConditions || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>優先度</td>
                  <td>{feature.priority || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>リスク</td>
                  <td>{feature.riskLevel || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>確度</td>
                  <td>{feature.confidence || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3
                style={{ fontSize: 'var(--fs-section-title)', margin: '0 0 16px', fontWeight: 600 }}
              >
                設計状況
              </h3>
              <table className="table" style={{ fontSize: 'var(--fs-body)' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: 140 }}>関連画面</td>
                    <td>{relatedScreens.length}画面</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>未確認事項</td>
                    <td>{openQuestions.length}件</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>テスト観点</td>
                    <td>{viewpoints.length}件</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>テストケース</td>
                    <td>{testCases.length}件</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {relatedScreens.length > 0 && (
              <div className="card">
                <h3
                  style={{
                    fontSize: 'var(--fs-section-title)',
                    margin: '0 0 12px',
                    fontWeight: 600,
                  }}
                >
                  関連画面
                </h3>
                <ul
                  style={{ margin: 0, padding: '0 0 0 16px', color: 'var(--color-text-secondary)' }}
                >
                  {relatedScreens.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'screens' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: '40%', minWidth: 300 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3
                style={{ fontSize: 'var(--fs-section-title)', margin: '0 0 12px', fontWeight: 600 }}
              >
                画面選択
              </h3>
              {relatedScreens.length === 0 ? (
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--fs-body)',
                    margin: 0,
                  }}
                >
                  この機能に関連する画面がありません。プロジェクトダッシュボードから画面を追加してください。
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {relatedScreens.map((s) => (
                    <button
                      key={s.id}
                      className="btn btn-ghost btn-sm"
                      style={{
                        justifyContent: 'flex-start',
                        background:
                          selectedScreenId === s.id ? 'var(--color-primary-soft)' : undefined,
                        fontWeight: selectedScreenId === s.id ? 600 : 400,
                      }}
                      onClick={() => {
                        setSelectedScreenId(s.id);
                        setSelectedUiNodeId(null);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedScreen && (
              <div className="card">
                <h3
                  style={{
                    fontSize: 'var(--fs-section-title)',
                    margin: '0 0 12px',
                    fontWeight: 600,
                  }}
                >
                  UI要素ツリー
                </h3>
                {uiNodeTree.length === 0 ? (
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--fs-body)',
                      margin: '0 0 12px',
                    }}
                  >
                    この画面にUI要素がありません。
                  </p>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <UiNodeTree
                      tree={uiNodeTree}
                      selectedId={selectedUiNodeId}
                      onSelect={setSelectedUiNodeId}
                      onAddChild={(parentId) => setCreatingUiNode({ parentId })}
                      onEdit={(id) => {
                        const found = allUiNodes.find((n) => n.id === id);
                        if (found) setEditingUiNode(found);
                      }}
                      onRemove={(id) => {
                        const found = allUiNodes.find((n) => n.id === id);
                        if (found) setRemovingUiNode(found);
                      }}
                    />
                  </div>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setCreatingUiNode({ parentId: undefined })}
                >
                  UI要素を追加
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {selectedScreen && !selectedUiNodeId && (
              <div className="card">
                <ScreenDetailPanel
                  screen={selectedScreen}
                  onAddUiNode={() => setCreatingUiNode({ parentId: undefined })}
                />
              </div>
            )}
            {selectedUiNodeId &&
              (() => {
                const selectedNode = allUiNodes.find((n) => n.id === selectedUiNodeId);
                if (!selectedNode) return null;
                return (
                  <div className="card">
                    <h3
                      style={{
                        fontSize: 'var(--fs-section-title)',
                        margin: '0 0 12px',
                        fontWeight: 600,
                      }}
                    >
                      UI要素詳細
                    </h3>
                    <table className="table" style={{ fontSize: 'var(--fs-body)' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600, width: 120 }}>名前</td>
                          <td>{selectedNode.name}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Role</td>
                          <td>{selectedNode.role || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>ComponentType</td>
                          <td>{selectedNode.componentType || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>説明</td>
                          <td>{selectedNode.description || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Selector</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            {selectedNode.selectorHint || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>表示テキスト</td>
                          <td>{selectedNode.textHint || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            {!selectedScreen && (
              <div className="card">
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 0',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  左のリストから画面を選択してください
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'data-rules' && (
        <div className="grid-2col">
          <div>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 'var(--fs-section-title)', margin: 0, fontWeight: 600 }}>
                データ型
              </h3>
              <div className="page-header-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreateDataType(true)}
                >
                  新規データ型
                </button>
              </div>
            </div>
            {dataTypes.length === 0 ? (
              <div className="card">
                <EmptyState
                  title="データ型がありません"
                  description="入力値やパラメータのデータ型を定義しましょう。"
                  action={
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowCreateDataType(true)}
                    >
                      データ型を作成
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>名前</th>
                      <th>基本型</th>
                      <th>説明</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTypes.map((dt) => (
                      <tr key={dt.id}>
                        <td style={{ fontWeight: 600 }}>{dt.name}</td>
                        <td>{dt.baseType}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          {dt.description || '-'}
                        </td>
                        <td className="actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditingDataType(dt)}
                          >
                            編集
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setRemovingDataType(dt)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 'var(--fs-section-title)', margin: 0, fontWeight: 600 }}>
                業務ルール
              </h3>
              <div className="page-header-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreateBusinessRule(true)}
                >
                  新規業務ルール
                </button>
              </div>
            </div>
            {businessRules.length === 0 ? (
              <div className="card">
                <EmptyState
                  title="業務ルールがありません"
                  description="この機能に関する業務ルールを定義しましょう。"
                  action={
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowCreateBusinessRule(true)}
                    >
                      業務ルールを作成
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>名前</th>
                      <th>種別</th>
                      <th>内容</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessRules.map((br) => (
                      <tr key={br.id}>
                        <td style={{ fontWeight: 600 }}>{br.name}</td>
                        <td>{br.ruleType}</td>
                        <td
                          style={{
                            color: 'var(--color-text-secondary)',
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {br.description}
                        </td>
                        <td className="actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditingBusinessRule(br)}
                          >
                            編集
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setRemovingBusinessRule(br)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'open-questions' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 'var(--fs-section-title)', margin: 0, fontWeight: 600 }}>
              未確定事項
            </h3>
            <div className="page-header-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateOpenQuestion(true)}
              >
                新規未確定事項
              </button>
            </div>
          </div>
          {openQuestions.length === 0 ? (
            <div className="card">
              <EmptyState
                title="未確定事項がありません"
                description="仕様の不確実性を明示的に管理しましょう。質問、コンテキスト、確信度を記録します。"
                action={
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateOpenQuestion(true)}
                  >
                    未確定事項を作成
                  </button>
                }
              />
            </div>
          ) : (
            <OpenQuestionTable
              openQuestions={openQuestions}
              onEdit={setEditingOpenQuestion}
              onRemove={setRemovingOpenQuestion}
            />
          )}
        </div>
      )}

      {activeTab === 'viewpoints' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 'var(--fs-section-title)', margin: 0, fontWeight: 600 }}>
              テスト観点
            </h3>
            <div className="page-header-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateViewpoint(true)}
              >
                新規テスト観点
              </button>
            </div>
          </div>
          {viewpoints.length === 0 ? (
            <div className="card">
              <EmptyState
                title="テスト観点がありません"
                description="テスト技法や優先度を指定して観点を定義しましょう。"
                action={
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateViewpoint(true)}
                  >
                    テスト観点を作成
                  </button>
                }
              />
            </div>
          ) : (
            <TestViewpointTable
              viewpoints={viewpoints}
              testCaseCounts={testCaseCountsByViewpoint}
              onEdit={setEditingViewpoint}
              onRemove={setRemovingViewpoint}
            />
          )}
        </div>
      )}

      {activeTab === 'test-cases' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 'var(--fs-section-title)', margin: 0, fontWeight: 600 }}>
              テストケース
            </h3>
            <div className="page-header-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateTestCase(true)}
              >
                新規テストケース
              </button>
            </div>
          </div>
          {testCases.length === 0 ? (
            <div className="card">
              <EmptyState
                title="テストケースがありません"
                description="テスト観点をもとに具体的なテストケースを作成しましょう。"
                action={
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateTestCase(true)}
                  >
                    テストケースを作成
                  </button>
                }
              />
            </div>
          ) : (
            <TestCaseTable
              testCases={testCases}
              viewpoints={viewpoints}
              onEdit={setEditingTestCase}
              onRemove={setRemovingTestCase}
            />
          )}
        </div>
      )}

      {activeTab === 'traceability' && (
        <div className="card">
          <p
            style={{
              color: 'var(--color-text-secondary)',
              margin: 0,
              textAlign: 'center',
              padding: '48px 0',
            }}
          >
            トレーサビリティ表示は後続Phaseで追加します。
          </p>
        </div>
      )}

      {editing && feature && (
        <FeatureEditDialog
          feature={feature}
          onUpdate={handleUpdate}
          onUpdated={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {creatingUiNode && (
        <UiNodeCreateDialog
          parentNode={
            creatingUiNode.parentId
              ? (allUiNodes.find((n) => n.id === creatingUiNode.parentId) ?? null)
              : null
          }
          projectId={projectId ?? ''}
          onCreate={handleCreateUiNode}
          onCreated={() => {
            setCreatingUiNode(null);
            toast.toast('success', 'UI要素を作成しました');
          }}
          onCancel={() => setCreatingUiNode(null)}
        />
      )}

      {editingUiNode && (
        <UiNodeEditDialog
          node={editingUiNode}
          onUpdate={handleUpdateUiNode}
          onUpdated={() => {
            toast.toast('success', 'UI要素を更新しました');
          }}
          onCancel={() => setEditingUiNode(null)}
        />
      )}

      {removingUiNode && (
        <ConfirmDialog
          title="UI要素を削除"
          message={`「${removingUiNode.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveUiNode}
          onCancel={() => setRemovingUiNode(null)}
        />
      )}

      {showCreateDataType && (
        <DataTypeCreateDialog
          onCreate={createDataType}
          onCreated={() => {
            setShowCreateDataType(false);
            toast.toast('success', 'データ型を作成しました');
          }}
          onCancel={() => setShowCreateDataType(false)}
        />
      )}

      {editingDataType && (
        <DataTypeEditDialog
          dataType={editingDataType}
          onUpdate={handleEditDataType}
          onUpdated={() => {
            toast.toast('success', 'データ型を更新しました');
          }}
          onCancel={() => setEditingDataType(null)}
        />
      )}

      {removingDataType && (
        <ConfirmDialog
          title="データ型を削除"
          message={`「${removingDataType.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveDataType}
          onCancel={() => setRemovingDataType(null)}
        />
      )}

      {showCreateBusinessRule && (
        <BusinessRuleCreateDialog
          onCreate={(input) => createBusinessRule({ ...input, featureId })}
          onCreated={() => {
            setShowCreateBusinessRule(false);
            toast.toast('success', '業務ルールを作成しました');
          }}
          onCancel={() => setShowCreateBusinessRule(false)}
        />
      )}

      {editingBusinessRule && (
        <BusinessRuleEditDialog
          businessRule={editingBusinessRule}
          onUpdate={handleEditBusinessRule}
          onUpdated={() => {
            toast.toast('success', '業務ルールを更新しました');
          }}
          onCancel={() => setEditingBusinessRule(null)}
        />
      )}

      {removingBusinessRule && (
        <ConfirmDialog
          title="業務ルールを削除"
          message={`「${removingBusinessRule.name}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveBusinessRule}
          onCancel={() => setRemovingBusinessRule(null)}
        />
      )}

      {showCreateOpenQuestion && (
        <OpenQuestionCreateDialog
          onCreate={handleCreateOpenQuestion}
          onCreated={() => {
            setShowCreateOpenQuestion(false);
            toast.toast('success', '未確定事項を作成しました');
          }}
          onCancel={() => setShowCreateOpenQuestion(false)}
        />
      )}

      {editingOpenQuestion && (
        <OpenQuestionEditDialog
          openQuestion={editingOpenQuestion}
          onUpdate={handleUpdateOpenQuestion}
          onUpdated={() => {
            toast.toast('success', '未確定事項を更新しました');
          }}
          onCancel={() => setEditingOpenQuestion(null)}
        />
      )}

      {removingOpenQuestion && (
        <ConfirmDialog
          title="未確定事項を削除"
          message={`「${removingOpenQuestion.question}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveOpenQuestion}
          onCancel={() => setRemovingOpenQuestion(null)}
        />
      )}

      {showCreateViewpoint && (
        <TestViewpointCreateDialog
          onCreate={handleCreateViewpoint}
          onCreated={() => {
            setShowCreateViewpoint(false);
            toast.toast('success', 'テスト観点を作成しました');
          }}
          onCancel={() => setShowCreateViewpoint(false)}
        />
      )}

      {editingViewpoint && (
        <TestViewpointEditDialog
          viewpoint={editingViewpoint}
          onUpdate={handleUpdateViewpoint}
          onUpdated={() => {
            toast.toast('success', 'テスト観点を更新しました');
          }}
          onCancel={() => setEditingViewpoint(null)}
        />
      )}

      {removingViewpoint && (
        <ConfirmDialog
          title="テスト観点を削除"
          message={`「${removingViewpoint.title}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveViewpoint}
          onCancel={() => setRemovingViewpoint(null)}
        />
      )}

      {showCreateTestCase && (
        <TestCaseCreateDialog
          onCreate={handleCreateTestCase}
          onCreated={() => {
            setShowCreateTestCase(false);
            toast.toast('success', 'テストケースを作成しました');
          }}
          onCancel={() => setShowCreateTestCase(false)}
          viewpointOptions={viewpoints.map((vp) => ({ id: vp.id, title: vp.title }))}
        />
      )}

      {editingTestCase && (
        <TestCaseEditDialog
          testCase={editingTestCase}
          onUpdate={handleUpdateTestCase}
          onUpdated={() => {
            toast.toast('success', 'テストケースを更新しました');
          }}
          onCancel={() => setEditingTestCase(null)}
          viewpointOptions={viewpoints.map((vp) => ({ id: vp.id, title: vp.title }))}
        />
      )}

      {removingTestCase && (
        <ConfirmDialog
          title="テストケースを削除"
          message={`「${removingTestCase.title}」を削除します。この操作は取り消せません。`}
          confirmLabel="削除する"
          onConfirm={handleRemoveTestCase}
          onCancel={() => setRemovingTestCase(null)}
        />
      )}
    </div>
  );
}
