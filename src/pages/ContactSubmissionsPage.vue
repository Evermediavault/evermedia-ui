<template>
  <PageBase :title="t('contactSubmissions.title')" icon="mark_email_read" content-class="full">
    <div class="contact-submissions-page">
      <div class="ev-glass-card ev-list-card contact-submissions-page__wrap">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="contact-submissions-page__error ev-banner-error" rounded>
          {{ error.message }}
          <template #action>
            <q-btn flat :label="t('common.retry')" @click="() => fetchList()" />
          </template>
        </q-banner>

        <div v-if="!loading && !error && list.length === 0" class="contact-submissions-page__empty">
          <q-icon name="mail_outline" size="3rem" class="contact-submissions-page__empty-icon" />
          <p>{{ t('contactSubmissions.noData') }}</p>
        </div>

        <div v-else class="contact-submissions-page__grid">
          <button
            v-for="row in list"
            :key="row.id"
            type="button"
            class="contact-submissions-page__card"
            @click="openDetail(row)"
          >
            <div class="contact-submissions-page__card-accent" aria-hidden="true" />
            <div class="contact-submissions-page__card-head">
              <span class="contact-submissions-page__card-name">{{ row.userName }}</span>
              <span class="contact-submissions-page__card-date">{{
                formatDate(row.createdAt, DATE_FORMATS.DATETIME_SHORT)
              }}</span>
            </div>
            <div class="contact-submissions-page__card-email">{{ row.email }}</div>
            <p class="contact-submissions-page__card-preview">{{ previewContent(row.content) }}</p>
            <span class="contact-submissions-page__card-hint">{{ t('contactSubmissions.tapForDetail') }}</span>
          </button>
        </div>

        <div v-if="meta && meta.total > 0" class="ev-table-pagination-wrap contact-submissions-page__pager">
          <q-pagination
            v-model="pagination.page"
            :max="maxPages"
            :max-pages="7"
            direction-links
            boundary-links
            color="primary"
            class="ev-table-pagination"
            @update:model-value="refetch"
          />
        </div>
      </div>
    </div>

    <EvModal
      v-model="detailOpen"
      :title="detailTitle"
      max-width="32rem"
      @close="selected = null"
    >
      <div v-if="selected" class="contact-submissions-page__detail ev-field-theme">
        <div class="contact-submissions-page__detail-row">
          <span class="contact-submissions-page__detail-label">{{ t('contactSubmissions.fields.email') }}</span>
          <a :href="`mailto:${selected.email}`" class="contact-submissions-page__detail-link">{{ selected.email }}</a>
        </div>
        <div class="contact-submissions-page__detail-row">
          <span class="contact-submissions-page__detail-label">{{ t('contactSubmissions.fields.ip') }}</span>
          <span class="contact-submissions-page__detail-mono">{{ selected.ip }}</span>
        </div>
        <div class="contact-submissions-page__detail-row">
          <span class="contact-submissions-page__detail-label">{{ t('contactSubmissions.fields.createdAt') }}</span>
          <span>{{ formatDate(selected.createdAt, DATE_FORMATS.DATETIME_SHORT) }}</span>
        </div>
        <div class="contact-submissions-page__detail-content">
          <span class="contact-submissions-page__detail-label">{{ t('contactSubmissions.fields.content') }}</span>
          <pre class="contact-submissions-page__detail-pre">{{ selected.content }}</pre>
        </div>
      </div>
      <template #actions>
        <q-btn flat no-caps :label="t('common.close')" color="grey" @click="detailOpen = false" />
      </template>
    </EvModal>
  </PageBase>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PageBase from 'src/components/PageBase.vue';
import EvModal from 'src/components/EvModal.vue';
import { formatDate, DATE_FORMATS } from 'src/utils/date/formatter';
import { useContactSubmissionList } from 'src/composables/useContactSubmissionList';
import type { ContactSubmissionItem } from 'src/types/api';

const CONTACT_SUBMISSION_PAGE_SIZE = 12;

const { t } = useI18n();
const { list, meta, loading, error, load } = useContactSubmissionList();

const pagination = ref({
  page: 1,
  rowsPerPage: CONTACT_SUBMISSION_PAGE_SIZE,
});

const selected = ref<ContactSubmissionItem | null>(null);
const detailOpen = ref(false);

const maxPages = computed(() => Math.max(1, meta.value?.total_pages ?? 1));

const detailTitle = computed(() =>
  selected.value
    ? t('contactSubmissions.detailTitle', { name: selected.value.userName })
    : '',
);

function previewContent(text: string, max = 140) {
  const s = text.trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function buildParams() {
  return {
    page: pagination.value.page,
    page_size: pagination.value.rowsPerPage,
    sort_by: 'created_at' as const,
    order: 'desc' as const,
  };
}

async function fetchList() {
  await load(buildParams());
}

function refetch() {
  void fetchList();
}

function openDetail(row: ContactSubmissionItem) {
  selected.value = row;
  detailOpen.value = true;
}

onMounted(() => {
  void fetchList();
});
</script>

<style lang="scss" scoped>
.contact-submissions-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.contact-submissions-page__wrap {
  position: relative;
  padding: var(--ev-space-4);
  min-height: 12rem;
}

.contact-submissions-page__error {
  margin-bottom: var(--ev-space-4);
}

.contact-submissions-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ev-space-3);
  padding: var(--ev-space-10) var(--ev-space-4);
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-sm);
}

.contact-submissions-page__empty-icon {
  opacity: 0.5;
}

.contact-submissions-page__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--ev-space-4);
}

@media (min-width: 600px) {
  .contact-submissions-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .contact-submissions-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.contact-submissions-page__card {
  position: relative;
  text-align: left;
  padding: var(--ev-space-4);
  border-radius: var(--ev-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 8, 18, 0.65);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.contact-submissions-page__card:hover {
  border-color: rgba(10, 77, 211, 0.45);
  box-shadow: 0 8px 32px rgba(6, 186, 217, 0.12);
  transform: translateY(-2px);
}

.contact-submissions-page__card:focus-visible {
  outline: 2px solid var(--ev-color-primary);
  outline-offset: 2px;
}

.contact-submissions-page__card-accent {
  position: absolute;
  top: 0;
  left: var(--ev-space-4);
  right: var(--ev-space-4);
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, #0a4dd3, #06bad9);
  opacity: 0.85;
}

.contact-submissions-page__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ev-space-2);
  margin-bottom: var(--ev-space-2);
  padding-top: var(--ev-space-2);
}

.contact-submissions-page__card-name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  font-size: var(--ev-font-size-sm);
}

.contact-submissions-page__card-date {
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
  flex-shrink: 0;
}

.contact-submissions-page__card-email {
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
  margin-bottom: var(--ev-space-3);
  word-break: break-all;
}

.contact-submissions-page__card-preview {
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-muted);
  line-height: 1.5;
  margin: 0 0 var(--ev-space-3);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contact-submissions-page__card-hint {
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.contact-submissions-page__pager {
  margin-top: var(--ev-space-6);
  justify-content: center;
}

.contact-submissions-page__detail {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
}

.contact-submissions-page__detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-1);
}

.contact-submissions-page__detail-label {
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.contact-submissions-page__detail-link {
  color: var(--ev-color-primary-light);
  word-break: break-all;
}

.contact-submissions-page__detail-mono {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
}

.contact-submissions-page__detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-2);
}

.contact-submissions-page__detail-pre {
  margin: 0;
  padding: var(--ev-space-3);
  border-radius: var(--ev-radius-md);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: inherit;
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 50vh;
  overflow: auto;
}
</style>
