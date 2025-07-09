package com.stratton_oakmont.study_planer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.stratton_oakmont.study_planer.repository",
    entityManagerFactoryRef = "studyPlanEntityManagerFactory",
    transactionManagerRef = "studyPlanTransactionManager"
)
public class StudyPlanDatabaseConfig {

    @Primary
    @Bean(name = "studyPlanDataSource")
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource studyPlanDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "studyPlanEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean studyPlanEntityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(studyPlanDataSource());
        em.setPackagesToScan("com.stratton_oakmont.study_planer.entity");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        return em;
    }

    @Primary
    @Bean(name = "studyPlanTransactionManager")
    public PlatformTransactionManager studyPlanTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(studyPlanEntityManagerFactory().getObject());
        return transactionManager;
    }
}